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
    if (api.state.isChangeModelValid) {
        api.data.sow_remediate_create_record_1.execute({
            remedialActionParams: api.state.fieldValueMap,
            remedialActionExecutionId: api.context.props.parentRecord
        });
    }
}
