/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const item = api.context.props.item;
    const reload =  item.props_details.soft_reload == 'false' ? true : false;
    const fields = !item.props_details.fields ? {} : JSON.parse(item.props_details.fields);
    const params = !item.props_details.page_parameters ? {} : JSON.parse(item.props_details.page_parameters);
    
    let payload = {
        reload: reload,
        route: item.page_route,
        fields,
        params
    };
    api.emit('NAV_ITEM_SELECTED', payload);
}
