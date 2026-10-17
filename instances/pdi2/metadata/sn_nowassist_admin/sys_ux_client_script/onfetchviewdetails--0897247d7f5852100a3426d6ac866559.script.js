/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
var result = api.data.get_review_page_details_1.output;
 api.setState("samplePhrases", result?.samplePhrases);
 api.setState("deploymentChannels", result?.deploymentChannels);
 api.setState("activeDeploymentChannelsCount", result?.activeDeploymentChannelsCount);
 api.setState("filterDetails", result?.filterDetails);
 api.setState("showViewDetailModal", true);
 helpers.modal.open('view_details_modal');
}
