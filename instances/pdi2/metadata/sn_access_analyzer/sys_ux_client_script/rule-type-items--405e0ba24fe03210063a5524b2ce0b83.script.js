/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var defaultLst = [{
        "id": "record",
        "label": "Table (record)"
    }, {
        "id": "client_callable_script_include",
        "label": "Client callable script include"
    }, {
        "id": "ui_page",
        "label": "UI page"
    }, {
        "id": "rest_endpoint",
        "label": "REST endpoints"
    }];
    if (api.state.aiAgentsEnabled) {
        defaultLst.push({
            "id": "gen_ai_agent",
            "label": "AI agent"
        });
        defaultLst.push({
            "id": "gen_ai_workflow",
            "label": "Agentic Workflow"
        });
    }
    return defaultLst;
}
