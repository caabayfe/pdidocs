/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const huiStatus = api.state.huiStatus;
    const db = api.data.playbook_data_broker_1;
    const contextIds = db.playbookContextIdsInOrder || [];
    if (contextIds.length === 0) return [];
    const latestContext = db.playbookContextIdsInOrder[contextIds.length - 1];
    const processData = db.playbooksByContextId[latestContext];
    if (!processData) return [];
    const lanes = db.playbooksByContextId[latestContext].lanes;
    const inProgressLanes = lanes.filter(l => l.cards.length && l.show && l.state.value != 'COMPLETE');
    return huiStatus == 'completed' || inProgressLanes.length > 0;
}
