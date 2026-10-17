/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return {
        label: api.state.createControllerClicked ? helpers.translateSync('Creating') : helpers.translateSync('Create'),
        appendToPayload: {
            context: 'modal-create-controller'
        },
        disabled: !api.state.controllerName
    };
}
