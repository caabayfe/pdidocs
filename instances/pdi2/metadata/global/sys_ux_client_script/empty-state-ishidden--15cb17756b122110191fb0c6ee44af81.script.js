/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let topics = api.data.controller.allTopics;

    Object.keys(topics).forEach(key => {
        let item = topics[key];
        if (Object.keys(item).length == 0) {
            delete topics[key];
        }
    });

    let currentTaxonomyTopicsPresent = (topics !== null && topics !== undefined && Object.keys(topics).length !== 0);
    return currentTaxonomyTopicsPresent;
}
