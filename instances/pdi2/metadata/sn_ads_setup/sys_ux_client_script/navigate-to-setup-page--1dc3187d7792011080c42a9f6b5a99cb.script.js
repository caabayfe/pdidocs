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
    let header = null;
    let controlExternalTask = null;
    if (api.context.props && api.context.props.hidePolarisHeader == 'true') {
        header = 'true';
    }

    if (api.context.props && api.context.props.controlExternalTask == 'true') {
        controlExternalTask = 'true';
    }

    helpers.navigate.to("setup", {
        "sysId": api.context.props.setupId
    }, {
        "customId": new Date().getTime(),
        "hidePolarisHeader": header,
        "controlExternalTask": controlExternalTask
    });
}
