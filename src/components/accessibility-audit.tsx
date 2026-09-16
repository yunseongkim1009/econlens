"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
/** Opt-in developer-only audit UI; excluded from production by the layout guard. */
export function AccessibilityAudit() {
  const enabled = useSearchParams().get("audit") === "1";
  const [report, setReport] = useState("Not run");
  if (!enabled) return null;
  return (
    <aside aria-label="Developer accessibility audit" className="audit-panel">
      <button
        type="button"
        onClick={async () => {
          setReport("Running…");
          try {
            const axe = await import("axe-core");
            const result = await axe.default.run(document, {
              runOnly: {
                type: "tag",
                values: ["wcag2a", "wcag2aa", "wcag21aa"],
              },
            });
            setReport(
              JSON.stringify(
                {
                  violations: result.violations.map((v) => ({
                    id: v.id,
                    impact: v.impact,
                    description: v.description,
                    nodes: v.nodes.map((n) => ({
                      target: n.target,
                      summary: n.failureSummary,
                    })),
                  })),
                  incomplete: result.incomplete.map((v) => ({
                    id: v.id,
                    nodes: v.nodes.length,
                  })),
                  passes: result.passes.length,
                },
                null,
                2,
              ),
            );
          } catch (error) {
            setReport(String(error));
          }
        }}
      >
        Run accessibility audit
      </button>
      <pre role="status">{report}</pre>
    </aside>
  );
}
