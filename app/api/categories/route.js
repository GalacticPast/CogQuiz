import { getAllCategories} from '@/lib/db'

export async function POST(request) {
  try {
    console.log("Im trying to get all the categories")
    const category = await getAllCategories()
    console.log(category)
    return Response.json({ success: true, category })
  } catch (e) {
    if (e.message === 'Not authenticated') {
      return Response.json({ error: 'Not logged in' }, { status: 401 })
    }

    return Response.json({ error: e.message }, { status: 500 })
  }
}
