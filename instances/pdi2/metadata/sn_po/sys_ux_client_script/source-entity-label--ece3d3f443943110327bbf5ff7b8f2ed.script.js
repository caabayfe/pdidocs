/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.context.props.projectId != -1) {
        return api.state.sourceTypeInput.find((type) => type.id == api.state.projectDetails?.sourceType)?.label || helpers.translateSync('Table');
    } else {
        if (api.state.sourceTypeName == 'Table') {
            return helpers.translateSync('Table');
        }
        return api.state.sourceTypeInput.find((type) => type.id == api.state.sourceType)?.label;
    }
}
