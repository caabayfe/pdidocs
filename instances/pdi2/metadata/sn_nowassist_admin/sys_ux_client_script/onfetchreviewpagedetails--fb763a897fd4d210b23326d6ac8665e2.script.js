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
    var filterDetailsReviewLayout = [
        {
            "label": "Name",
            "value": {
                "type": "string",
                "value": api.data.get_review_page_details_1?.output?.filterDetails?.name
            }
        },
        {
            "label": "Description",
            "value": {
                "type": "string",
                "value": api.data.get_review_page_details_1?.output?.filterDetails?.description
            }
        },
        {
            "label": "Type",
            "value": {
                "type": "string",
                "value": api.data.get_review_page_details_1?.output?.filterDetails?.filterType
            }
        },
        {
            "label": "Product workflow",
            "value": {
                "type": "string",
                "value": api.data.get_review_page_details_1?.output?.filterDetails?.product
            }
        }
    ];
    api.setState('filterDetailsReviewLayout', filterDetailsReviewLayout);
    api.setState('samplePhrases', api.data.get_review_page_details_1?.output?.samplePhrases);
    api.setState('deploymentChannels', api.data.get_review_page_details_1?.output?.deploymentChannels);
    api.setState('filterDetails', api.data.get_review_page_details_1?.output?.filterDetails);
    api.setState('reviewPageDetails', api.data.get_review_page_details_1?.output);
}
