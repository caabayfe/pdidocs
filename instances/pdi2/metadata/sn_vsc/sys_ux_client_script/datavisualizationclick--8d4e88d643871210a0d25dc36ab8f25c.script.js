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
    const query = event?.payload?.params?.query;
    var defaultLoadQuery = api?.state?.defaultLoadListFilter;
    let finalQuery='';
    let listTitle = '';
    if(!query) {
        const indicatorSysId = event?.payload?.params?.indicatorSysid;
        // If the click happened from the all hardening settings widget, its a reset to all settings
        if (indicatorSysId == "c725162518678110f877e53e0f01871f") {
            finalQuery = defaultLoadQuery;
            // Update the list title with the type of visualization clicked
            listTitle = "All hardening settings";
        }
    } else {
        // If the click has happened from compliant/non-compliant widget, apply the default list fliter query AND the visualization one
        finalQuery = defaultLoadQuery + "^" + query;
        // Update the list title with the type of visualization clicked
        if(query.includes("compliance_status=compliant")) {
            listTitle = "Compliant settings";
        } else {
            listTitle = "Non-compliant settings";
        }
    }
    api.setState("listTitle", listTitle);
    api.setState("dataVizQuery", finalQuery);
}
