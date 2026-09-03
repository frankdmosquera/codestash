# Phase 4 — Team Features

Makes the role model from Phase 1 actually mean something day-to-day,
not just at the invite/delete-org level.

## Locked decisions

- **Member-edit-quota enforcement happens at the server-action layer** —
  the same create/edit actions built in Phase 3 check
  `memberEditQuota.editCount < editLimit` before allowing a `member`-role
  write, and increment on success. The table (`member_edit_quota`) has
  existed since before this roadmap; this is the first code that
  actually reads or writes it.
- **Seat management UI extends `/workspace/members`** (already exists)
  rather than creating a new page for it.

## Checklist

- [ ] Wire `memberEditQuota` reads/writes into the manual/snippet create+edit actions from Phase 3
- [ ] Add a remaining-quota indicator in the editor UI ("3 of 5 edits used this month")
- [ ] Extend `/workspace/members` with seat count vs. plan limit, and a remove-member action
- [ ] Confirm the Organization Manager / role-level mapping decided in Phase 1 is fully enforced here — invite restricted to Manager + level 2, matching better-auth's existing owner/admin invite permissions

## Deferred, on purpose

- Per-member custom permission overrides beyond the 3 fixed levels — not
  planned at all right now, intentionally kept simple.

## Exit condition

An invited member's actual capabilities are governed by their assigned
role, not just whether they're in the org at all.
