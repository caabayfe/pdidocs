function transform(input) {
    let isBuildAgentEnabled = false;
    let studioAppNamespace;
    let agentConfig = {};
    try {
        // TODO: Remove the below code once DEF0589428 is fixed
        const buildAgentConfig = input?.isBuildAgentEnabled ? JSON.parse(input.isBuildAgentEnabled) : null;
        isBuildAgentEnabled = UDCUtil.shouldRenderBuildAgent(buildAgentConfig);

        // TODO: Remove the below code once DEF0589428 is fixed
        const namespaceConfig = input?.studioAppNamespace ? JSON.parse(input.studioAppNamespace) : null;
        studioAppNamespace = namespaceConfig?.studioAppNamespace;
    } catch (error) {
        gs.error(`Error parsing studioAppNamespace/isBuildAgentEnabled: ${error.message}`);
    }

    if (isBuildAgentEnabled) {
        agentConfig = BuildAgentConfig.getBuildAgentConfig(studioAppNamespace);
    }
    return agentConfig;
}
