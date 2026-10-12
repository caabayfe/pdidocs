/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    // Get the system propery
    const sysPropResult = api.data.get_system_properties.output.data.GlideRecord_Query.sys_properties._results;
    const {
        value
    } = sysPropResult[0].value;
    if (api.state.projectDetails.status !== "RETIRED") {
        api.setState('ProjectRetiredModalContent', await helpers.translate(`Setting the project's status to 'Retired' will eventually clean the generated results in {0} days. Do you still want to proceed with this operation?`, value));
    }

}
