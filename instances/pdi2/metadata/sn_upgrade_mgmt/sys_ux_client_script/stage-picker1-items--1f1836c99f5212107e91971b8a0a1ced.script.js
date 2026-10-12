/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let contextIds = api.data.playbook_custom_layout.playbookContextIdsInOrder;
    let recordAction = api.state.recordAction;
    let contextId = api.state.contextSysId || (recordAction=='CREATE' && contextIds[contextIds.length - 1]) || '';

    if (!contextId || !contextIds || contextIds.length === 0 || !contextIds.includes(contextId)) return [];
    let processData = api.data.playbook_custom_layout.playbooksByContextId[contextId];
    let lanes = processData.lanes.filter(l => l.cards.length);

    const lanesData = lanes.map(lane => {
        return {
            "label": lane.title,
            "id": lane.contextId
        };
    });
    return lanesData;
}
