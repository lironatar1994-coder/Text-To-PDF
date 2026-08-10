<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Visitor signals

- Public English and Hebrew layouts emit anonymous navigation signals through the same-origin `/text-to-pdf/api/visit-signal` route.
- Keep the shared key server-only in `/root/.visitor-signal-key` or `VISITOR_SIGNAL_KEY`; never expose it through browser code or a `NEXT_PUBLIC_*` variable.
- These events confirm first-party JavaScript execution, not a person, conversion, or customer.
