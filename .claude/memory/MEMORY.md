# Memory Index

## User

- [user_adhd_design.md](./user_adhd_design.md) — User has ADHD; all design must be scannable, visual, bite-sized

## Feedback

- [feedback_frontend_design.md](./feedback_frontend_design.md) — Use frontend-design skill for all UI changes in this project
- [feedback_tailwind_docs_scanning.md](./feedback_tailwind_docs_scanning.md) — Never use `className="..."` or arbitrary-value Tailwind placeholders in .planning/** docs
- [feedback_wait_for_input.md](./feedback_wait_for_input.md) — Never implement design choices without explicit user selection at checkpoints
- [feedback_gsd_state_accuracy.md](./feedback_gsd_state_accuracy.md) — GSD state files must reflect reality
- [feedback_no_raw_buttons.md](./feedback_no_raw_buttons.md) — Never use raw `<button>` elements — always use the ui Button component, adding variants as needed
- [feedback_focus_visible_only.md](./feedback_focus_visible_only.md) — Always use focus-visible, never bare focus
- [feedback_section_container.md](./feedback_section_container.md) — Use .section-container for consistent horizontal padding
- [feedback_tailwind_variable_syntax.md](./feedback_tailwind_variable_syntax.md) — Use Tailwind v4 shorthand for CSS variable references: `bg-(--var)` not `bg-[var(--var)]`
- [feedback_wcag_aa.md](./feedback_wcag_aa.md) — All UI must meet WCAG 2.2 AA: text contrast 4.5:1, explicit text colors on colored backgrounds

## References

- [reference_context7_library_ids.md](./reference_context7_library_ids.md) — Known Context7 library IDs (skip resolve for these)
