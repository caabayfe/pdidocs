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
    //call API to apply the findings
    let findingDefIds = [];
    findingDefIds = api.state.ruleBasedIds.length + api.state.automatedIds.length;
    if (findingDefIds > 0) {
        api.data.copy_selected_finding_definitions_to_project.execute({
            "projectId": api.context.props.projectId,
            "ruleFindingDefIds": api.state.ruleBasedIds,
            "automatedFindingDefIds": api.state.automatedIds
        });
        api.setState('ruleBasedIds',[]);
        api.setState('automatedIds',[]);
    }
}
