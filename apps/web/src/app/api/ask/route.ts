import { NextResponse } from "next/server"
import * as Sentry from "@sentry/nextjs"
import { createServerClient } from "@/lib/supabase"
import {
  answerQuestion,
  BabyNotFoundError,
  ConversationAccessError,
  AskUpstreamError,
} from "@/lib/ask/answer-question"

// A parent's question, not a document. Bounds cost -- an unbounded body
// goes straight to OpenAI at our expense -- and is generous enough that no
// real question should ever hit it.
const MAX_QUESTION_LENGTH = 2000

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

  if (body.question.length > MAX_QUESTION_LENGTH) {
    return NextResponse.json(
      { error: `question must be ${MAX_QUESTION_LENGTH} characters or fewer` },
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

    if (err instanceof ConversationAccessError) {
      return NextResponse.json({ error: err.message }, { status: 403 })
    }

    if (err instanceof AskUpstreamError) {
      // Per the contract: any error here is a plain "couldn't reach the
      // assistant" state, never a cached or generated fallback, and never
      // anything that degrades toward a medical answer.
      console.error("[ask] Upstream error:", err.message)
      // Handled gracefully for the user, but still worth Sentry visibility -
      // repeated upstream failures are an operational signal, not a bug in
      // this route. The question text itself never reaches Sentry: the
      // request body is stripped globally in scrubPii's beforeSend.
      Sentry.captureException(err)
      return NextResponse.json(
        { error: "Couldn't reach the assistant. Please try again." },
        { status: 502 }
      )
    }

    console.error("[ask] Unexpected error:", err)
    Sentry.captureException(err)
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 })
  }
}
