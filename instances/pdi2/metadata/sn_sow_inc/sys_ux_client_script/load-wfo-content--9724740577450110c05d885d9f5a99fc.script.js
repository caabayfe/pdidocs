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
    const wfo_itsm_plugin_status = api.data.enabled_plugins.output && api.data.enabled_plugins.output.length > 0 ? 
                                    api.data.enabled_plugins.output.find(p => p.id === "sn_wfo_cfg_itsm") : {} ;
    const wfo_learning_plugin_status = api.data.enabled_plugins.output && api.data.enabled_plugins.output.length > 0 ? 
                                    api.data.enabled_plugins.output.find(p => p.id === "com.sn_coach_learning") : {} ;
    
    const showPerformanceTarget =  wfo_itsm_plugin_status.active &&
        api.data.check_user_roles.output && api.data.check_user_roles.output['sn_team_perf.team_performance_user'];
    const showlearningPath = wfo_learning_plugin_status.active && 
        api.data.check_user_roles.output && api.data.check_user_roles.output['sn_coaching.trainee'];

    if (showPerformanceTarget) {
        api.setState("showPerformanceTarget", showPerformanceTarget);
        api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', {
            viewportElementId: 'viewport_nwr',
            route: 'performance-target',
            fields: null,
            params: null
        });
    }

    if (showlearningPath) {
        api.setState("showLearningPath", showlearningPath);
        api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', {
            viewportElementId: 'viewport_lyb',
            route: 'learning-path-widget',
            fields: null,
            params: null
        });
    }
}
