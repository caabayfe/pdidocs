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
    const guidanceId = '550918d9439412102280698f38b8f26a';
    const { actionConfigurations } = api.context.props.customExpProps;
    const knowledge = api.state.knowledgeArticleId;
    const { short_description } = api.data.get_preview_fields.result;
    const attachArticleGuidanceHelper = imports["sn_guidances.AttachArticleGuidanceHelper"](...arguments);
    const actionConfigMetaData = attachArticleGuidanceHelper.getActionConfigMetaData(actionConfigurations, guidanceId, knowledge, short_description.displayValue);
    attachArticleGuidanceHelper.handleAttachArticleEvents(guidanceId, actionConfigMetaData);

}
