/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
     
     var target = api.context.props.payload.props_details.new_tab_config ? '_blank' : '_self';
     api.emit("NAV_ITEM_SELECTED", {
     external: {
         url: api.context.props.payload.props_details.plugin_home_url,
         target: target
     }
 });
}
