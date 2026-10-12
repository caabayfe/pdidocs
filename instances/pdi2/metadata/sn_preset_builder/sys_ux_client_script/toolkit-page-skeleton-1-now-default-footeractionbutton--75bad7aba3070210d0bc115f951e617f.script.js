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
        label: api.state.createPresetClicked ? helpers.translateSync('Creating') : helpers.translateSync('Create'),
        appendToPayload: {
            context: 'modal-create-preset'
        },
        disabled: !api.state.presetName || !api.state.selectedController.id || !api.state.selectedComponent.id
    };
}
