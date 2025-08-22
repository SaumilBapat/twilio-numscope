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
    const bearer = process.env.QA_API_BEARER?.trim()

    // Debug environment variables
    console.log("Raw bearer token:", JSON.stringify(bearer))
    console.log("Bearer token length:", bearer?.length)
    console.log("Expected token: 'asHJSVS223'")

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

    async function callUpstream(url: string, tryWithoutBearer = false) {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)
      
      const authHeader = tryWithoutBearer ? bearer : `Bearer ${bearer}`
      
      // Debug logging
      console.log("Making request to:", url)
      console.log("Authorization header:", authHeader)
      console.log("Request body:", JSON.stringify({ question: composedQuestion }))
      
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ question: composedQuestion }),
          signal: controller.signal,
        })
        const text = await res.text()
        let parsed: any = undefined
        try { 
          parsed = JSON.parse(text)
          console.log("Parsed API response:", JSON.stringify(parsed, null, 2))
        } catch { 
          console.log("Failed to parse JSON response:", text)
        }
        return { res, text, parsed }
      } finally {
        clearTimeout(timeout)
      }
    }

    // Try primary first with Bearer prefix
    let attempt = await callUpstream(apiUrlPrimary).catch((err: unknown) => ({ res: undefined as any, text: String(err), parsed: undefined }))

    // If 401, try without Bearer prefix
    if (attempt.res?.status === 401) {
      console.log("Got 401, trying without Bearer prefix...")
      attempt = await callUpstream(apiUrlPrimary, true).catch((err: unknown) => ({ res: undefined as any, text: String(err), parsed: undefined }))
    }

    // If gateway/timeouts, try fallback once
    if (!attempt.res || !attempt.res.ok) {
      const status = attempt.res?.status
      const shouldFallback = !attempt.res || status === 502 || status === 503 || status === 504
      if (shouldFallback && apiUrlFallback && apiUrlFallback !== apiUrlPrimary) {
        const second = await callUpstream(apiUrlFallback).catch((err: unknown) => ({ res: undefined as any, text: String(err), parsed: undefined }))
        if (second.res && second.res.ok) {
          const answer2 = second.parsed?.answer ?? ""
          const recommendedNumbers2 = second.parsed?.recommendedNumbers ?? []
          return NextResponse.json({ answer: answer2, recommendedNumbers: recommendedNumbers2 })
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
    const recommendedNumbers = attempt.parsed?.recommendedNumbers ?? []
    
    console.log("Sending to client - answer:", answer ? "present" : "missing")
    console.log("Sending to client - recommendedNumbers:", Array.isArray(recommendedNumbers) ? `${recommendedNumbers.length} items` : "not an array")
    
    return NextResponse.json({ answer, recommendedNumbers })
  } catch (_error) {
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 })
  }
}