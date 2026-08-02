# ADR 0004: Human-only publication

Status: accepted

AI research is evidence-backed drafting assistance, not an editor. It writes immutable research runs only. Materializing a draft is a separate staff action, and changing `_status` to `published` requires an admin. Scheduled jobs may compute lifecycle flags or queue review but never invent facts or publish.
