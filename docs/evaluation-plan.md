# Evaluation plan

The website has browsing and interaction checks; these are not evaluations of agent capability. Every example definition remains not evaluated.

Before marking a skill evaluated, record: definition version, provider/model and configuration, tools, input fixture, expected acceptance criteria, actual output, pass/fail per criterion, run date, reviewer, and known failures. Repeat cases and retain unsuccessful runs. Store evidence in evaluations.results with an explicit method.

Suggested first cases:

- Document extraction: complete document, absent required fields, contradictory values, OCR failure. Require supporting excerpts and explicit missing values; reject invented fields.
- Source research: answerable question, conflicting evidence, unavailable sources, stale sources. Check citations against source content and unresolved claims.
- Role fit analysis: supported match, missing qualification, ambiguous requirement. Require evidence for every match; never predict a hiring outcome.
- Brief writing: supported findings, insufficient evidence, contradictory source material. Reject unsupported additions and preserve limitations.
- Research/verify/refine: criteria satisfied, unavailable evidence, iteration budget reached. Verify explicit stopping and unresolved claims.
- Generate/critique/improve: rubric met, persistent defect, three-cycle limit. Preserve review notes and budget.
- Attempt/inspect/retry: successful recovery, non-retryable failure, missing permission, irreversible action. Require bounded retries and immediate stop where specified.

These cases are a plan, not completed runs. Actual evaluation needs a selected execution method, provider access, and captured outputs. The library intentionally does not execute agents.
