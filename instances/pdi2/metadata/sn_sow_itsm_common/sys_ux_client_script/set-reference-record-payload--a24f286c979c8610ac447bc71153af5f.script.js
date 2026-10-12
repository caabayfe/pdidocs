/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

	let eventName = event.name;
	let fieldItems ={};
	switch (eventName) {
        case 'NOW_TEXT_LINK#CLICKED':
            fieldItems = {
				"table" : event.context.item.value.table,
				"sysId" : event.context.item.value.sysId
			};
            break;

        case 'NOW_BUTTON#CLICKED':
            fieldItems = {
				"table" : api.state.popoverPayload.table,
				"sysId" : api.state.popoverPayload.sysId
			};
            break;
        default:
            break;
    }
	
    api.emit("SOW#OPEN_REFERENCE_RECORD", {"fields": fieldItems});
}
