#!/usr/bin/env bash
# PostToolUse(Write) hook.
# When a NEW markdown doc is created under docs/, remind to review the whole
# docs/ structure and update READMEs + references in the same change set.
# Non-blocking: only ever injects a reminder; always exits 0.
# Fires only for NEW files (untracked in git) — full-rewrites of existing docs
# stay silent, so this isn't noisy on edits.

input="$(cat)"
fp="$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty' 2>/dev/null)"
[ -n "$fp" ] || exit 0

case "$fp" in
  *"/docs/"*.md) ;;   # only markdown under a docs/ directory
  *) exit 0 ;;
esac

root="$(git rev-parse --show-toplevel 2>/dev/null)"
[ -n "$root" ] || exit 0

# Already tracked = an existing doc being rewritten, not a new one -> stay silent.
if git -C "$root" ls-files --error-unmatch "$fp" >/dev/null 2>&1; then
  exit 0
fi

jq -n '{hookSpecificOutput:{hookEventName:"PostToolUse",additionalContext:"STANDING RULE (doc-structure discipline) — a new doc was just created under docs/. Before moving on: review the whole docs/ tree and ask whether this file'"'"'s placement still makes sense, or the structure needs a new folder/subfolder (a new domain gets its own folder, not a dump into an existing one). Then update the affected README(s) and every reference to this file, in the SAME change set, so no README or cross-reference goes stale."}}' 2>/dev/null

exit 0
