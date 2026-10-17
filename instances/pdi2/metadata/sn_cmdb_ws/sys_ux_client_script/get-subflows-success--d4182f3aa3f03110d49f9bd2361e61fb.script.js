/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const results = api.data.data_manager_get_available_subflows.output;
    let subflows = [];

    subflows.push({
        "label" : await helpers.translate("Select"),
        "id": ""
    });
    results.forEach((subflowData) => {
        subflows.push(subflowData);
    });
    api.setState("subflowListItems", subflows);
}
