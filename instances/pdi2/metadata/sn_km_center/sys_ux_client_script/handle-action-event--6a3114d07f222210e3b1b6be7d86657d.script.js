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

    // Single Item Action
    if (event.elementId == 'result_dropdown') {
        
        const selectedScan = event.context.item.parent;
        const selectedResults = [event.context.item];

        if (event.payload.item.id == 'action') {

            //open modal if input is required
            if (utils.openModal(selectedScan, selectedResults)) {
                return;
            }

            if (utils.replaceContent(selectedResults[0].value.result)) {
                utils.addAlert("update", selectedResults[0].value.result.name);
            }

        } else if (event.payload.item.id == 'ignore') {

            api.data.kb_article_assist_set_scan_state.execute({
                "sysId": selectedResults[0].value.sysId,
                "newState": "ignore"
            });

            utils.addAlert("ignore", selectedResults[0].value.result.name);
        }

        utils.removeResults(selectedScan, selectedResults);

        return;
    } 
    
    // Full Card Action
    let selectedScan = {};
    let actionType = "update";
    if (event.elementId == 'card_base_actions_1') {
        selectedScan = event.context.item;
        if (event.payload.action.label == api.state.aoTranslations.ignore || 
            event.payload.action.label == api.state.aoTranslations.ignoreAll) {
            actionType = "ignore";
        }
    } else {
        selectedScan = api.state.selectedScan;
        if (event.elementId == 'show_more_ignore_button') {
            actionType = "ignore";
        }
    }

    if (actionType == "ignore") {
        api.data.kb_article_assist_set_scan_state.execute({
            "targetRecord": selectedScan.value.targetRecordSysId,
            "scanDefinition": selectedScan.value.scanDefinitionSysId,
            "newState": "ignore"
        });

        utils.addAlert("ignore", selectedScan.value.name);
        
        utils.removeResults(selectedScan);

    //Update/Review action
    } else {
        const selectedResults = selectedScan.value.results.map((result, idx) => {
            return {
                index: idx,
                value: result
            };
        });

        //Open Modal if there are inputs
        const inputs = selectedScan?.value?.inputs || [];
        if (inputs.length) {

            if (utils.openModal(selectedScan, selectedResults)) {
                return;
            }
            //Run update scripts
        } else {
            if (utils.replaceAllContent(selectedResults.map(item => {
                return item.value.result;
            }))) {
                utils.addAlert("update", selectedScan.value.name);
            }
            
            utils.removeResults(selectedScan);
        }
    }
}
