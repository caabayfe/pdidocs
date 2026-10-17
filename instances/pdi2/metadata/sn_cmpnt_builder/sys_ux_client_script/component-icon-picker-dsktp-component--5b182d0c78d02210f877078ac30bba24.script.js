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
        icon: typeof api.state.componentIcon === 'string' ? api.state.componentIcon: '',
        imageIcon: typeof api.state.componentIcon === 'object' ? api.state.componentIcon.name : ''
    };
}
