/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var validationError=api.state.cbValidationError||'';
    return {
        label: api.state.componentCreateClicked ? helpers.translateSync('Creating...') : helpers.translateSync('Create'),
        // Current sn-uibtk-page-skeleton version doesn't support appendToMeta yet
        appendToPayload: {
            context: 'cb-modal-create-component'
        },
        disabled: api.state.isDescInvalid || !api.state.componentName || api.state.componentCreateClicked || validationError.length>0
    };
}
