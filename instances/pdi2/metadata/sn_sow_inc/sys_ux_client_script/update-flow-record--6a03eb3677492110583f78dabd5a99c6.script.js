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
    var output = event.payload.data.output;
    if (output && output.action_execution_id) {
        api.data.parent_record.refresh();
        var obj = {};
        obj['state'] = 'COMPLETE';
        api.data.update_record.execute({
            table: 'sys_flow_data',
            sys_id: api.context.props.experienceProperties.flow_record.value,
            data: JSON.stringify(obj)
        });
    } else {
        api.setState("hasError", true);
        let erroMessage = await helpers.translate("Some error occured, please contact your system administrator");
        api.setState("errorMessage", erroMessage);
    }
}
