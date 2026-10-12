/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const isFocusedPickerHidden = api.state.layoutConfig.isFocusedPickerHidden;
    const playbookData = api.data.playbook_custom_layout;
    if (!playbookData || isFocusedPickerHidden) return true;
    const playbooksContextIds = api.data.playbook_custom_layout.playbookContextIdsInOrder || [];
    if (!playbooksContextIds.length) return [];
    const contextId = playbooksContextIds[playbooksContextIds.length - 1];
    const processData = playbookData.playbooksByContextId[contextId];
    const lanes = processData && processData.lanes.filter(l => l.cards.length);
    const selectedStageContextId = playbookData.selectedItem.stageContextId;
    const laneIndex = lanes && lanes.findIndex(lane => lane.contextId === selectedStageContextId);
    const categoryCompleted = lanes[laneIndex].state.value === 'COMPLETE';
    if (laneIndex === -1 || categoryCompleted) return true;
    return lanes[laneIndex].optionalActivities.length === 0;
}
