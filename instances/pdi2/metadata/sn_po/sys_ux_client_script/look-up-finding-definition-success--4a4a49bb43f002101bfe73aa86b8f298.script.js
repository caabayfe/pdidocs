/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    // API always returns a value from `promin_finding_def`, even if the ID is not given
    // hence checking if the return value `sys_id` matches the URL `findingDefId` param
    const isCurrentFinding = api.data.look_up_finding_definition.result?.sys_id.value === api.context.props.findingDefId;
    const currentFindingName = isCurrentFinding ? api.data.look_up_finding_definition.result?.message?.displayValue : '';

    api.setState('currentFindingName', currentFindingName);

    if (currentFindingName) {
        helpers.screen.updateStatus({
            title: await helpers.translate('{0} | Improvement opportunity definition', currentFindingName),
        });
    }
}
