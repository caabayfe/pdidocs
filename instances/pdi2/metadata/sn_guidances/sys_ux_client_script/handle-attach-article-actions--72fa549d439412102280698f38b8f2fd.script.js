/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { guidanceId, actionConfigurations } = api.context.props;
    const attachArticleGuidanceHelper = imports["sn_guidances.AttachArticleGuidanceHelper"](...arguments);
    const knowledge = api.state.knowledgeArticleId;
    const articleTitle = api.data.get_knowledge_record_details_1.articleDetails.articleInfo.shortDescription;
    const actionConfigMetaData = attachArticleGuidanceHelper.getActionConfigMetaData(actionConfigurations, guidanceId, knowledge, articleTitle);
    attachArticleGuidanceHelper.handleAttachArticleEvents(guidanceId, actionConfigMetaData);
}
