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
    
    const utils = imports["sn_km_center.ArticleAssistUIUtils"](api, helpers);

    const {inputs, selectedResults, selectedScan, modalTabs } = api.state;
    utils.replaceAllContent((selectedResults.map(item => item.value.result)), inputs, modalTabs);

    helpers.modal.close("[component-id$='input_modal']");

    const alertName = selectedResults.length > 1 
        ? selectedScan.value.name 
        : selectedResults[0].value.result.name;
    utils.addAlert("update", alertName);
    
    utils.removeResults(selectedScan, selectedResults);
}
