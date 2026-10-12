// src/server/domain/dispatcher.ts
// The agent-run dispatch collaborator: prepare creates the conversation and durable
// run activity; enqueue starts the Foundry turn after the work item has claimed
// in_progress. Splitting the phases keeps activity creation ahead of the state write
// without letting a callback reach an item that still appears ready.
import * as foundry from '../foundry/client.ts';
import * as activity from '../glide/activity.ts';
import { insertConversation } from '../glide/conversationRecord.ts';
import { loadInstructionsForDispatch } from './instructions.ts';
import { label } from '../shared/label.ts';
// The opening prompt is the trusted dispatch snapshot. Keep it self-contained
// and machine-readable: Foundry's turn contract has no separate structured
// context field. The execution agent may read authoritative plan, dependency,
// work-item, and activity records when useful, but it does not need a recovery
// read before it can begin the happy path.
function dispatchPrompt(item) {
    return [
        'Execute exactly one authoritative AutoEng work-item snapshot.',
        JSON.stringify(item),
        'When prerequisites or prior attempts matter, read their authoritative Build Agent records and verify consequential identities on the live instance.',
        'Implement and verify the requested ServiceNow metadata change through a Now SDK Fluent project. End the turn by calling `autoeng_report_outcome` exactly once.'
    ].join('\n');
}
export function prepareRun(item, principal, automaticRetry) {
    // The run thread's title is human-facing wherever activity is listed.
    // DEF0906139 — agentId matches executionAgentPackId() in server/foundry/client.ts:
    // this run's Foundry turns are always the autoeng_developer pack, so the conversation
    // record should say so too (chargeAssist.js bills off this field, not ba_variant_type).
    const conversation = insertConversation({ title: `Run · ${label(item.work_item)}`, client: 'foundry', user: principal, agentId: 'autoeng_developer' });
    if (!conversation)
        throw new Error(`dispatch failed: no run conversation for ${item.work_item.number}`);
    // The durable anchor is mandatory: `kind` is the distinction the engine itself
    // queries, so a missing activity row IS fatal to the dispatch.
    const runActivity = activity.insertActivity({
        conversation,
        kind: 'run',
        plan: item.plan.sys_id,
        work_item: item.work_item.sys_id,
        ...(automaticRetry && { prior_activity: automaticRetry.priorActivityId })
    });
    if (!runActivity)
        throw new Error(`dispatch failed: no run activity row for ${item.work_item.number}`);
    return { conversation, activity: runActivity };
}
// `atfWithApp`/`atfWithAppRunUi` are captured at executePlan() time (see
// WorkItem.dispatchAtfWithApp/dispatchAtfWithAppRunUi) and passed here
// separately, NOT as DispatchItem fields — DispatchItem is JSON.stringify'd
// straight into the dispatch prompt (dispatchPrompt below), and these flags
// are a turn-capability concern the model has no business seeing.
export function enqueueRun(run, item, principal, atfWithApp, atfWithAppRunUi) {
    // Pre-fetch the principal's custom instructions (skills + rules) so the
    // execution turn carries them in the payload — no elicitation client exists
    // on the non-interactive path.
    const instructions = loadInstructionsForDispatch(principal);
    if (!foundry.enqueueToForge(run.conversation, dispatchPrompt(item), principal, instructions, atfWithApp, atfWithAppRunUi)) {
        throw new Error(`dispatch rejected for ${item.work_item.number}`);
    }
}
