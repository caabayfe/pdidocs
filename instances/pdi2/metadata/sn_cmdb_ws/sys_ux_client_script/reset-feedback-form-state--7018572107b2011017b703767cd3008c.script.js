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
    // workaround for bug in UIB where input controls retained their previous states
    // reset radio button
    const feedbackSentimentArr = [
        {
            "id":"positive",
            "label": await helpers.translate("Yes")
        },
        {
            "id":"negative",
            "label": await helpers.translate("No")
        }
    ];
    api.setState('feedback_sentiment_options', feedbackSentimentArr);

    // reset checkboxes
    const feedbackCategoriesArr = [{
        "order": 0,
        "checked": false,
        "itemId": "table",
        "label": await helpers.translate("Table or query builder node"),
        "link": {}
    }, {
        "order": 1,
        "checked": false,
        "itemId": "relationship",
        "label": await helpers.translate("Relationship connector"),
        "link": {}
    }, {
        "order": 2,
        "checked": false,
        "itemId": "relatedtable",
        "label": await helpers.translate("Non-CMDB table"),
        "link": {}
    }, {
        "order": 3,
        "checked": false,
        "itemId": "filter",
        "label": await helpers.translate("Query filter"),
        "link": {}
    }, {
        "order": 4,
        "checked": false,
        "itemId": "other",
        "label": await helpers.translate("Other"),
        "link": {}
    }];
    api.setState('feedback_categories_options', feedbackCategoriesArr);
}
