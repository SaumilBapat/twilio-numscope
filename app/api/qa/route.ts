import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      question?: string
      details?: {
        smsType?: string
        useCase?: string
        businessPresence?: string
        timeline?: string
        volume?: string
        voiceRequired?: string
        selectedCountries?: string[]
      }
      history?: Array<{ role?: string; content?: string }>
    }

    const question = body?.question

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Invalid request: 'question' is required" }, { status: 400 })
    }

    // Use env vars - these must be configured
    const apiUrlPrimary = process.env.QA_API_URL
    const apiUrlFallback = process.env.QA_API_URL_FALLBACK
    const bearer = process.env.QA_API_BEARER

    // Basic safeguard: refuse to proxy if values are not configured
    if (!apiUrlPrimary || !bearer) {
      return NextResponse.json({ error: "Server not configured. Set QA_API_URL and QA_API_BEARER environment variables." }, { status: 500 })
    }

    // Build a richer prompt for the upstream API while preserving its expected shape
    const details = body?.details
    const history = Array.isArray(body?.history) ? body?.history : []

    const formattedDetails = details
      ? `\n\nDetails:\n- SMS Type: ${details.smsType ?? ""}\n- Use Case: ${
          details.useCase ?? ""
        }\n- Business Presence: ${details.businessPresence ?? ""}\n- Timeline: ${
          details.timeline ?? ""
        }\n- Expected Volume: ${details.volume ?? ""}\n- Voice Required: ${
          details.voiceRequired ?? ""
        }\n- Selected Countries: ${details.selectedCountries?.join(", ") ?? ""}`
      : ""

    const formattedHistory = history.length
      ? `\n\nConversation so far:\n${history
          .map((h) => `${h.role ?? "user"}: ${h.content ?? ""}`)
          .join("\n")}`
      : ""

    const composedQuestion = `${question}${formattedDetails}${formattedHistory}`

    async function callUpstream(url: string) {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${bearer}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ question: composedQuestion }),
          signal: controller.signal,
        })
        const text = await res.text()
        let parsed: any = undefined
        try { parsed = JSON.parse(text) } catch { /* non-JSON */ }
        return { res, text, parsed }
      } finally {
        clearTimeout(timeout)
      }
    }

    // Try primary first
    let attempt = await callUpstream(apiUrlPrimary).catch((err: unknown) => ({ res: undefined as any, text: String(err), parsed: undefined }))

    // If gateway/timeouts, try fallback once
    if (!attempt.res || !attempt.res.ok) {
      const status = attempt.res?.status
      const shouldFallback = !attempt.res || status === 502 || status === 503 || status === 504
      if (shouldFallback && apiUrlFallback && apiUrlFallback !== apiUrlPrimary) {
        const second = await callUpstream(apiUrlFallback).catch((err: unknown) => ({ res: undefined as any, text: String(err), parsed: undefined }))
        if (second.res && second.res.ok) {
          const answer2 = second.parsed?.answer ?? ""
          return NextResponse.json({ answer: answer2 })
        }
        return NextResponse.json(
          {
            error: "Upstream error",
            tried: [apiUrlPrimary, apiUrlFallback],
            status: second.res?.status ?? status ?? 502,
            body: second.parsed ?? second.text ?? attempt.parsed ?? attempt.text,
          },
          { status: second.res?.status ?? status ?? 502 }
        )
      }

      // No fallback or not a gateway error
      return NextResponse.json(
        { error: "Upstream error", tried: [apiUrlPrimary], status: status ?? 502, body: attempt.parsed ?? attempt.text },
        { status: status ?? 502 }
      )
    }

    const answer = attempt.parsed?.answer ?? ""
    return NextResponse.json({ answer })
  } catch (_error) {
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 })
  }
}


