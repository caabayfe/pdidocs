/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    var selectedOption = api.state.selectedOption;
    if (selectedOption === 'cmdb_model') {
        route(api, {
            "route": "record",
            "redirect": "true",
            "fields": {
                "table": "cmdb_model",
                "sysId": "-1"
            },
            "params": {
                "query": "bundle=true^cmdb_model_category=bundle"
            }
        });
    } else {
        route(api, {
            "route": "record",
            "redirect": "true",
            "fields": {
                "table": selectedOption,
                "sysId": "-1"
            }
        });
    }
    function route(api, params) {
        helpers.modal.close();
        api.emit('NAV_ITEM_SELECTED', params);
    }
}
