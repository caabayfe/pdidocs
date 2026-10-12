
/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
	//Following import statement is boiler-plate code for ACE client scripts. Please do not manipulate the next line.
	const aceUtils = imports["sn_ace.ACEClientScriptUtils"](api, helpers);
    
    const {navigateToPage} = imports['sn_instance_clone.InstanceCloneUtils']();
	const {eventName, eventPayload} = event.payload;
    
    var nav_payload;
    switch(eventName){
        case "NAVIGATE_TO_CLONE_REQUEST":
            navigateToPage(api, "clone-request", {'sysId': -1});
            break;
        default:
            break;
    }
}
