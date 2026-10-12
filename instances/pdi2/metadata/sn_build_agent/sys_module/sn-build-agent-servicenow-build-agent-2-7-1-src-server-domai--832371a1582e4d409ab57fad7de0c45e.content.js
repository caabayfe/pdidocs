// src/server/domain/runs.ts
// Read-only run-adjacent joins that belong to no single entity row. Reads use the
// record seam so unit tests can substitute the in-memory database.
import * as records from '../glide/records.ts';
// A run conversation's most recent message timestamp (sn_build_agent_conversation's
// own `last_message_at`, maintained by calculateLastMessageAtBR on every message
// insert) — the signal the stall watchdog (scheduled-scripts/implementationJobsMonitor.ts)
// reads instead of re-deriving it from sn_build_agent_message itself. '' for a
// conversation that has never received a message (or does not exist); the
// watchdog then falls back to the run activity's own sys_created_on (dispatch
// time) as the staleness baseline, rather than treating a blank value as
// instantly/maximally stale.
export function conversationLastMessageAt(conversationId) {
    const gr = records.newRecord('sn_build_agent_conversation');
    return gr.get(conversationId) ? String(gr.getValue('last_message_at') ?? '') : '';
}
