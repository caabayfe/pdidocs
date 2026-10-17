/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var item = event.payload.items;
   var itemId = item[0].id;
	api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
    	items: item
  	});
   helpers.timing.setTimeout(() =>  api.emit("NOW_UXF_PAGE#REMOVE_NOTIFICATIONS", {
    	items: [{id: itemId}] 
	}), 5000);
}
