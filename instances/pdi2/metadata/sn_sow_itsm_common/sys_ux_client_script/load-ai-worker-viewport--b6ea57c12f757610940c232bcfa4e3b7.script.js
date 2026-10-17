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
        if(!api.state.hideAIWorkers) return;
        var hasAdminOrSDMRole = api.context.session.user.roles.includes('admin') || api.context.session.user.roles.includes('sn_sow_itsm_common.sn_service_desk_manager');
        var enableAIWorkers = api.data.get_sections_visibility_1?.output?.enableAIWorkers;
        var isZTSDPluginActive = api.data.enabled_plugins?.output?.some(p => p.id === "sn_ztsd" && p.active);
        if (isZTSDPluginActive && enableAIWorkers == "true" && hasAdminOrSDMRole) {
            api.setState("hideAIWorkers", false);
            api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', {
                viewportElementId: 'viewport_1',
                route: 'ai-worker'
            });
        }
    }
