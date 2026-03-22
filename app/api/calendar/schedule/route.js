import { google } from 'googleapis';
import { createClient } from '@/lib/supabase-server';

/**
 * Calculates the final scheduled interval based on the user's mistakes.
 * 
 * @param {number} mistakes - The number of mistakes the user made during the quiz.
 * @param {number} baseInterval - The default algorithm-calculated interval.
 * @returns {number} The final interval in days, strictly clamped between 1 and 6 days.
 * 
 * Logic:
 * - If the user makes more than 1 mistake, they are penalized by subtracting 1 day from the interval.
 * - The returned value will never be less than 1 or greater than 6.
 */
function calculateScheduledInterval(mistakes, baseInterval) {
    let interval = baseInterval;
    if (mistakes > 1) {
        interval -= 1;
    }
    if (interval < 1) interval = 1;
    if (interval > 6) interval = 6;
    return interval;
}

/**
 * POST endpoint to schedule a Google Calendar review event for the user.
 * 
 * Expected Body payload: { deckId, totalQuestions, mistakes }
 * 
 * Flow for Brizein and Sulav:
 * 1. Checks for a valid user session and Google OAuth provider token via Supabase.
 * 2. Calculates a base interval based on the number of mistakes made (0 mistakes = 6 days, etc.).
 * 3. Adjusts the interval using calculateScheduledInterval() to get the target review date.
 * 4. Connects to the primary Google Calendar using the OAuth token.
 * 5. Checks if a "HackBase Review" event already exists on that target date to prevent overlap.
 * 6. If no event exists, it creates a 30-minute review block at 9:00 AM (America/Chicago timezone).
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const { deckId, totalQuestions, mistakes } = body;

        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return Response.json({ error: 'No session' }, { status: 401 });
        }

        if (!session.provider_token) {
            return Response.json({ error: 'No provider_token on session' }, { status: 401 });
        }

        let baseInterval = 1;
        if (mistakes === 0) {
            baseInterval = 6;
        } else if (mistakes === 1) {
            baseInterval = 4;
        } else if (mistakes <= 3) {
            baseInterval = 2;
        } else {
            baseInterval = 1;
        }

        const intervalDays = calculateScheduledInterval(mistakes, baseInterval);

        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + intervalDays);
        const dateStr = targetDate.toISOString().split('T')[0];

        // Setup Google Calendar OAuth2 Client
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: session.provider_token });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        // Check existing events on target date
        const timeMin = new Date(`${dateStr}T00:00:00Z`).toISOString();
        const timeMax = new Date(`${dateStr}T23:59:59Z`).toISOString();

        const eventsResponse = await calendar.events.list({
            calendarId: 'primary',
            timeMin: timeMin,
            timeMax: timeMax,
            q: 'HackBase Review',
            singleEvents: true,
        });

        const events = eventsResponse.data.items || [];

        if (events.length > 0) {
            return Response.json({
                merged: true,
                scheduled: false,
                date: dateStr,
                intervalDays,
                mistakes
            });
        }

        await calendar.events.insert({
            calendarId: 'primary',
            requestBody: {
                summary: 'HackBase Review Session',
                start: {
                    dateTime: `${dateStr}T09:00:00`,
                    timeZone: 'America/Chicago'
                },
                end: {
                    dateTime: `${dateStr}T09:30:00`,
                    timeZone: 'America/Chicago'
                }
            }
        });

        return Response.json({
            scheduled: true,
            merged: false,
            date: dateStr,
            intervalDays,
            mistakes
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}
