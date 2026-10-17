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
    if (event.payload.data && event.payload.data.output && event.payload.data.output.status == "Success") {
        if (event.payload.data.output.keyValuePairs && event.payload.data.output.keyValuePairs.state) {
            api.setState("showNextButton", false);
            var obj = {};
            obj['state'] = 'COMPLETE';
            api.data.update_record_1.execute({
                table: 'sys_flow_data',
                sys_id: api.context.props.experienceProperties.flow_record.value,
                data: JSON.stringify(obj)
            });
        } else {
            api.setState("showFormView", false);
            api.setState("showCardView", false);
            api.setState("showConflictCheckView", true);
            helpers.timing.setTimeout(() => api.data.change_management_conflict_1.refresh(), api.state.conflictCheckTimeout);
        }
    } else {
        api.setState("hasError", true);
        api.setState('errorMessage', event.payload.data.output.message);
    }
}
