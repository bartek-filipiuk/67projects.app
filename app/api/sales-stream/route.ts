import { encodeSseEvent, RECENT_SEED, generateMockSale } from "@/lib/revenue-stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      for (const sale of RECENT_SEED) {
        controller.enqueue(encoder.encode(encodeSseEvent({ type: "sale", payload: sale })));
      }
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(encodeSseEvent(null)));
        } catch {
          clearInterval(heartbeat);
        }
      }, 30_000);
      const tick = setInterval(() => {
        try {
          controller.enqueue(
            encoder.encode(encodeSseEvent({ type: "sale", payload: generateMockSale() })),
          );
        } catch {
          clearInterval(tick);
        }
      }, 12_000);
      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        clearInterval(tick);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      });
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
