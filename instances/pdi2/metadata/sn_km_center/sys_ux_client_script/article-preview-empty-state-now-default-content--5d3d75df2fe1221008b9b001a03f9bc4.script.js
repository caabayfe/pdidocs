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
        return helpers.translateSync('Get started by selecting a knowledge base to see all available article templates.');
    }

    if (!template) {
        return helpers.translateSync('Select an article template to see a preview.');
    }

    return '';
}
