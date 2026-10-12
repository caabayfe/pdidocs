/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let contextIds = api.data.playbook_custom_layout.playbookContextIdsInOrder || [];
    if (contextIds.length === 0) return [];
    let contextId = contextIds[contextIds.length - 1];
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
