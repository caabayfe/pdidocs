/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const approvalDecision = api.state.approvalDecision;

    const reason = api.state.approvalReason;

    const parts = reason?.split('\n');

    const result = parts?.reduce((acc, part) => acc + `<p>${part}</p>\\n`, '');

    const comment = `[code]${result?.trim() || ''}[/code]`;
    const approvalGroupSysID = api.state.approvalForGroup;

    const eventNameMap = {
        approved: 'CAB_MEETING#APPROVE_CURRENT_AGENDA_ITEM',
        rejected: 'CAB_MEETING#REJECT_CURRENT_AGENDA_ITEM'
    };

    const approvalDecisionEvent = eventNameMap[approvalDecision];
    if (approvalDecisionEvent)
        api.emit(approvalDecisionEvent, {
            comment,
            approvalGroupSysID
        });
}
