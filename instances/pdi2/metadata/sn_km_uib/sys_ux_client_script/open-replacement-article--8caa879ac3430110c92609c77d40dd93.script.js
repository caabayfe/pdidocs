/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    api.setState('isLoading', false);

    if (!api.data.get_replacement_article.replacementArticle.isValid) {
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: [{
                id: "knowledgeExistsAlert",
                status: "critical",
                content: {
                    type: "string",
                    value: await helpers.translate('You do not have sufficient privileges to access this knowledge item')
                },
                action: {
                    type: "dismiss"
                }
            }],
        });
        return;
    }
    
    api.setState('isValidArticle', true);
    const baseArticleId = api.context.props.sysId;
    const replacementArticleId = api.data.get_replacement_article.replacementArticle.sysId;
    const replacementArticleClass = api.data.get_replacement_article.replacementArticle.class;

    if (baseArticleId != replacementArticleId) {
        var redirectPayload = {
            "redirect": true,
            "route": "kb_view",
            "title": "Knowledge",
            "fields": {
                "table": replacementArticleClass,
                "sysId": replacementArticleId
            },
            "params": {
                "mode": "redirect",
                "base": baseArticleId
            }
        };

        api.emit("NAV_ITEM_SELECTED", redirectPayload);
    }
}
