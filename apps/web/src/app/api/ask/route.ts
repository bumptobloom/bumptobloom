import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { answerQuestion, BabyNotFoundError, AskUpstreamError } from "@/lib/ask/answer-question"

// The user id comes only from the verified session via getUser(), which
// revalidates the JWT against Supabase's auth server — never from the
// request body, which would be trivially forgeable. babyId, conversationId,
// and question are read from the body because there is no other source for
// them, but ownership of babyId is still verified server-side against the
// authenticated user before anything else happens.
export async function POST(request: Request) {
  const supabase = await createServerClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: { babyId?: unknown; conversationId?: unknown; question?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (typeof body.babyId !== "string" || typeof body.question !== "string" || !body.question.trim()) {
    return NextResponse.json(
      { error: "babyId and question are required" },
      { status: 400 }
    )
  }

  const conversationId = typeof body.conversationId === "string" ? body.conversationId : null

  try {
    const result = await answerQuestion({
      userId: user.id,
      babyId: body.babyId,
      conversationId,
      question: body.question,
    })

    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof BabyNotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 })
    }

    if (err instanceof AskUpstreamError) {
      // Per the contract: any error here is a plain "couldn't reach the
      // assistant" state, never a cached or generated fallback, and never
      // anything that degrades toward a medical answer.
      console.error("[ask] Upstream error:", err.message)
      return NextResponse.json(
        { error: "Couldn't reach the assistant. Please try again." },
        { status: 502 }
      )
    }

    console.error("[ask] Unexpected error:", err)
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 })
  }
}