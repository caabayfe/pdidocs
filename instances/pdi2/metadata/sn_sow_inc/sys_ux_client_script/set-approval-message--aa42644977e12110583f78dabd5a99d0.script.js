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
    let approvalMsg = await helpers.translate('Once the user approves, click {0} which will execute the action', api.context.props.experienceProperties.button_label.value);
    api.setState('approvalMsg',approvalMsg);
}
