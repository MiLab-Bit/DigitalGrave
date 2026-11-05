# DigitalGrave — Security Review Context

This policy captures current project-specific security review boundaries, not a statement of production security certification.

## Threats and trust boundaries
Review untrusted GitHub bios, repo names and links for XSS; cached/sharable values and URL parameters; client-side VITE_* variables are public and must never include secret tokens. Do not label simulated CID/pinning permanent or on-chain unless actually verified.

## Safe handling and evidence
- Use synthetic or approved test data; never commit secrets, access tokens, personal customer data, private credentials or environment files.
- Report exploitable findings with exact source SHA, source location, attacker-controlled input, expected/observed behavior, reproduction in an isolated environment, severity and minimally invasive fix.
- Do not invent CVEs, claim production authorization or weaken existing test gates. Separate genuine security defects from planned, absent or intentionally unsupported capabilities.
- Avoid publishing workable exploits or secrets in public PR/Issues. Coordinate privately with authorized repository owner or GitHub private advisories if available. This file does not imply private reporting is automatically enabled.
- Reviewing code under Codex is second-AI review, not independent human certification; merging, external service calls or production deployment still need owner authorization.
