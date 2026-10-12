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
    function onPageReady() {
        let translatedMessages = {};
        let promises = [
            helpers.translate("How do I get started with the Simulator?"),
            helpers.translate("How does the Simulator work?"),
            helpers.translate("How to enable or disable Actions in Access Simulator?")
        ];
        Promise.all(promises).then(values => {
            values.forEach((val, i) => translatedMessages["accordionItem" + i] = val);
            api.setState("translatedMessages", translatedMessages);
        });
    }

    function navigateToCriteriaPage(action) {
        /**
         * timestamp parameter included to avaid browser's caching issue on
         * simulator page, If the URL is same then, the browser will get the 
         * component from DOM tree only, so that I have added timestamp here, 
         * it will be changed every time, so that the data will be loaded from   
         * server instead of browser cache
         */
        helpers.navigate.to("simulator", {
            action: action,
            timestamp: Date.now()
        });
    }

    if (event.name == "MACROPONENT_READY") {
        onPageReady();
        return;
    }

    ({
        buttonAddRole: () => navigateToCriteriaPage("add-role"),
        buttonRemoveRole: () => navigateToCriteriaPage("remove-role"),
        buttonAddGroup: () => navigateToCriteriaPage("add-group"),
        buttonRemoveGroup: () => navigateToCriteriaPage("remove-group")
    } [event.elementId])();
}
