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
    const {
        guidanceId,
        actionConfigurations
    } = api.context.props;
    const attachArticleGuidanceHelper = imports["sn_guidances.AttachArticleGuidanceHelper"](...arguments);
    const knowledge = api.state.knowledgeArticleId;
    const articleTitle = api.data.get_knowledge_record_details_1.articleDetails.articleInfo.shortDescription;
    const actionConfigMetaData = attachArticleGuidanceHelper.getActionConfigMetaData(actionConfigurations, guidanceId, knowledge, articleTitle);
    const SECONDARY_ACTION_CLICKED = "NOW_DROPDOWN#ITEM_CLICKED";
    const PRIMARY_ACTION_CLICKED = "NOW_BUTTON#CLICKED";

    const {
        modal
    } = helpers;
    const {
        state,
        setState
    } = api;
    var articleData = api.data.get_knowledge_record_details_1.articleDetails;

    const insertRecord = function(table, fields, type) {
        api.data.create_record_1.execute({
            table,
            templateFields: fields
        });
    };

    var articleSysId = state.knowledgeArticleId;
    var templateFields = "article=" + articleSysId + "^";

    if (event.elementId == 'flag_article_button') {
        modal.close("[component-id$='flag_article_modal']");
        var comments = state.flagArticleContent.replaceAll("\n", "\\n").replaceAll("^", "&#94;");
        templateFields += "flagged=true^comments=" + comments;
        setState('flagArticleContent', comments);
        if (articleData.enableActionableFeedbackForFlag)
            templateFields += "^reason=Flagged";
        insertRecord('kb_feedback', templateFields, "flag_article");
    } else if (event.elementId == 'flag_article_comment') {
        var value = event.payload.fieldValue;
        var trimmedValue = attachArticleGuidanceHelper.getTrimmedValue(value);
        const disableFlagButton = trimmedValue && trimmedValue.length > 0 ? false : true;
        api.setState('disableFlagButton', disableFlagButton);
        api.setState('flagArticleContent', trimmedValue);
    } else {
        let actionId = '';
        if (event.name === PRIMARY_ACTION_CLICKED) {
            actionId = api.state.primaryAction.id;
        } else if (event.name === SECONDARY_ACTION_CLICKED) {
            actionId = event.payload.item.id;
        }

        if (actionId === 'mark-article-helpful') {
            templateFields += "useful=yes";
            insertRecord('kb_feedback', templateFields);
        } else if (actionId === 'flag-article') {
            api.setState('flagArticleContent', '');
            api.setState('disableFlagButton', true);
            modal.open("[component-id$='flag_article_modal']");
        } else {
            attachArticleGuidanceHelper.handleAttachArticleEvents(guidanceId, actionConfigMetaData);
        }
    }
}
