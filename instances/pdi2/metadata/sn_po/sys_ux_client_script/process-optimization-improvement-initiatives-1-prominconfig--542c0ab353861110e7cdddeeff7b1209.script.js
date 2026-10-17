function script({
    api,
    event
}) {
    const {
        prominConfig,
        automationCenterConfig
    } = api.state;
    return {
        ...prominConfig,
        automationCenterConfig
    };
}
