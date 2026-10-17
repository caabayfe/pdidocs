// src/server/engine/conversations.ts
// Conversation anchoring: which plan or work item is a given conversation about?
// Dispatch and reopen write activity rows; this module resolves them for callers.
import * as activity from '../glide/activity.ts';
import { conversationExists } from '../glide/conversationRecord.ts';
import { planReferenceFromSysId, workItemReferenceFromSysId } from '../domain/recordReferences.ts';
function activityDto(row) {
    return {
        sys_id: row.id,
        conversation: row.conversation || null,
        kind: row.kind,
        outcome: row.outcome || null,
        summary: row.summary,
        plan: planReferenceFromSysId(row.plan),
        work_item: row.work_item ? workItemReferenceFromSysId(row.work_item) : null,
        prior_activity: row.prior_activity || null,
        created: row.created
    };
}
export function readConversationActivity(conversationId) {
    if (!conversationExists(conversationId))
        return { status: 'conversation_not_found' };
    const row = activity.getActivityByConversation(conversationId);
    return row ? { status: 'found', activity: activityDto(row) } : { status: 'activity_not_found' };
}
export function readActivity(id) {
    const row = activity.getActivityById(id);
    return row ? activityDto(row) : null;
}
/**
 * Resolve a conversation to the work item / plan it is about.
 *
 * The execution agent holds its run's conversation id, not the item id, so this is
 * how its terminal declaration finds the row to settle. Rework chats use the same
 * anchor to recover their plan, work item, and prior activity context.
 */
export function getConversationAnchor(conversationId) {
    const row = activity.getActivityByConversation(conversationId);
    if (!row)
        return { anchored: false };
    const workItem = row.work_item || null;
    return {
        anchored: true,
        plan: planReferenceFromSysId(row.plan),
        work_item: workItem ? workItemReferenceFromSysId(workItem) : null
    };
}
