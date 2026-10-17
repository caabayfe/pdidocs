/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	  const {
        idleTimeConfiguration,
        processId,
        projectIdleTimeEnabled,
        projectTouchPointsEnabled,
        touchPoints,
        processConfigLoading,
        idleTimeConfigLoading,
    } = api.state;

    // Hide when process config is loading
    if (processConfigLoading) {
      return true;
    }

    // hide when process config is missing
    if (!processId && !projectIdleTimeEnabled) {
        return true;
    }

    // hide when both the touch points and idle time metrics are missing
    if (!projectIdleTimeEnabled && !projectTouchPointsEnabled &&
        !idleTimeConfiguration.isIdleTimeConfigValid &&
        touchPoints && !touchPoints.fields.length > 0) {
        return true;
    }

    if (idleTimeConfigLoading) {
      return true;
    }

    if (!idleTimeConfiguration.isIdleTimeConfigValid) {
      return false;
    }
    
    if (projectIdleTimeEnabled && idleTimeConfiguration.status) {
        return false;
    }

    return true;
}
