import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

// No request body is ever read here — auth comes only from the session
// cookie via getUser(), which revalidates the JWT against Supabase's auth
// server. A user id sent in the body would be trivially forgeable, so it is
// never trusted.
export async function POST() {
  const supabase = await createServerClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!process.env.OPENAI_API_KEY) {
    console.warn(
      "OPENAI_API_KEY is not set — Ask will not be able to call OpenAI once wired up."
    )
  }

  return NextResponse.json({
    answer: "Ask isn't wired up yet — check back soon.",
  })
}
