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
    var query = api.context.props.query;
    if(typeof(query) !== 'undefined' && query.indexOf('sys_class_name=alm_asset') !== -1) {
        query = query.replace('sys_class_name=alm_asset','');
    }
    var routes = {"route": "record","redirect": "true","fields": {"table": selectedOption,"sysId": "-1"},"params":{"query": query}};
        if (selectedOption === 'hardware') {
                routes.fields.table = 'alm_hardware';
                route(api,routes);
        }
        else if (selectedOption === 'consumable') {
                routes.fields.table = 'alm_consumable';
                route(api,routes);
        }
         else if (selectedOption === 'license') {
                routes.fields.table = 'alm_license';
                route(api,routes);
        }
        else if (selectedOption === 'bundle') {
                routes.fields.table = 'alm_bundle';
                route(api,routes);
        }
        else if (selectedOption === 'facility') {
                routes.fields.table = 'alm_facility';
                route(api,routes);
        }

    function route(api, params) {
        helpers.modal.close();
        api.emit('NAV_ITEM_SELECTED', params);
    }
}
