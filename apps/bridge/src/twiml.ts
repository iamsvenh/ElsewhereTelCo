/** TwiML builder for the incoming-call webhook. */

function escapeXml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

/**
 * <Connect><Stream> pointing Twilio's Media Stream back at our own
 * /media-stream WebSocket. Custom <Parameter>s arrive in the stream's
 * "start" event as customParameters — that's how the WS handler knows
 * which persona answers.
 */
export function connectStreamTwiml(params: {
  host: string;
  persona: string;
  from: string;
  to: string;
  callSid: string;
}): string {
  const url = escapeXml(`wss://${params.host}/media-stream`);
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="${url}">
      <Parameter name="persona" value="${escapeXml(params.persona)}" />
      <Parameter name="from" value="${escapeXml(params.from)}" />
      <Parameter name="to" value="${escapeXml(params.to)}" />
      <Parameter name="callSid" value="${escapeXml(params.callSid)}" />
    </Stream>
  </Connect>
</Response>`;
}
