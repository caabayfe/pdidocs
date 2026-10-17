// src/server/glide/conversationRecord.ts
// The engine's conversation-record insert. AutoEng creates both run and rework
// conversations locally in this app's table before anchoring them with an
// activity row. Forge is responsible only for enqueueing the turn.
//
// Cursors come from the record seam (glide/records.ts), the one GlideRecord
// construction site, so tests substitute the in-memory fake and never load the
// '@servicenow/glide' runtime.
import { newRecord } from './records.ts';
export function conversationExists(id) {
    if (!id)
        return false;
    const gr = newRecord('sn_build_agent_conversation');
    return Boolean(gr.get(id));
}
// Run conversations belong to this scoped app, so create them locally instead of
// asking Foundry to round-trip through the instance conversation REST route. That
// callback has no usable headless credential before the turn exists. The insert
// also records the execution class atomically rather than relying on a later stamp.
//
// DEF0906139 — every conversation this function creates is AutoEng's own (a run or a
// rework, per the file comment above), never an ordinary interactive BA chat. So unlike
// the interactive create/update REST routes (which derive ba_variant_type from agentId,
// since those chats can be either), this one is unconditionally 'autonomous_engineer' —
// no derivation needed.
export function insertConversation(fields) {
    const gr = newRecord('sn_build_agent_conversation');
    gr.initialize();
    gr.setValue('title', fields.title);
    gr.setValue('client', fields.client);
    gr.setValue('user', fields.user);
    if (fields.agentId)
        gr.setValue('agent_id', fields.agentId);
    gr.setValue('ba_variant_type', 'autonomous_engineer');
    const id = gr.insert();
    return id ? String(id) : null;
}
