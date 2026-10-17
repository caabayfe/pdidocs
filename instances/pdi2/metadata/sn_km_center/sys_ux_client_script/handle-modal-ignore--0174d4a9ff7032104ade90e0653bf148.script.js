/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    
    const utils = imports["sn_km_center.ArticleAssistUIUtils"](api, helpers);
    const {inputs, selectedResults, selectedScan, modalTabs } = api.state;
    
    if (selectedResults.length == 1) {
        api.data.kb_article_assist_set_scan_state.execute({
            "sysId": selectedResults[0].value.sysId,
            "newState": "ignore"
        });

        utils.addAlert("ignore", selectedResults[0].value.result.name);
        utils.removeResults(selectedScan, selectedResults);

    } else {
        
        api.data.kb_article_assist_set_scan_state.execute({
            "targetRecord": selectedScan.value.targetRecordSysId,
            "scanDefinition": selectedScan.value.scanDefinitionSysId,
            "newState": "ignore"
        });

        utils.addAlert("ignore", selectedScan.value.name);
        utils.removeResults(selectedScan);
    }
       
    helpers.modal.close("[component-id$='input_modal']");
}
