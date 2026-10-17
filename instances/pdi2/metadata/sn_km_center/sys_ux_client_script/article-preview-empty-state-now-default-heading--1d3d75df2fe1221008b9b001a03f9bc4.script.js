/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const {
        knowledgeBaseSysId,
        template
    } = api.state;

    if (!knowledgeBaseSysId) {
        return {
            label: helpers.translateSync('No knowledge base selected.')
        };
    }

    if (!template) {
        return {
            label: helpers.translateSync('No article template selected.')
        };
    }

    return {
        label: ''
    };
}
