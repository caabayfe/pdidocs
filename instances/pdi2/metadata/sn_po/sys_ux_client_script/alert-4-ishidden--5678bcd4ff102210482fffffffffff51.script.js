/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const {
        processId,
        idleTimeConfiguration,
        touchPoints,
        projectTouchPointsEnabled,
        projectIdleTimeEnabled,
        processConfigLoading,
        selectedEntity,
    } = api.state;

    if(selectedEntity?.source_type?.value === api.state.SOURCE_TYPES.AGENTIC_AI_DATA) {
        return true;
    }
    
    if (processConfigLoading) {
        return true;
    }

    if (!processId && !projectIdleTimeEnabled && !projectTouchPointsEnabled) {
        return false;
    }

    if (!projectIdleTimeEnabled && !projectTouchPointsEnabled &&
        !idleTimeConfiguration.isIdleTimeConfigValid &&
        touchPoints && !touchPoints.fields.length > 0) {
        return false;
    }

    return true;

}
