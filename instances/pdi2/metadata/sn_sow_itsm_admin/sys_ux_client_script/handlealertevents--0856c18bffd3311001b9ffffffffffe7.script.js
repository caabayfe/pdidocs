/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
	//Following import statement is boiler-plate code for ACE client scripts. Please do not manipulate the next line.
	const aceUtils = imports["sn_ace.ACEClientScriptUtils"](api, helpers);
	const {eventName, eventPayload} = event.payload;
    //state variables --> aceContents, blockcontext
     var blockcontext = await aceUtils.getContext();
    //Default Client Scripts to handle updates to aceContents and blockcontext should be in App Shell
    if (eventName == "dismiss-alert-clicked") {
        if(eventPayload.contentBlockId == "e1fc5d83ff13311001b9ffffffffffcc") {
            blockcontext.showActivateAlert = false;
        } else if(eventPayload.contentBlockId == "661a954bff17311001b9ffffffffffda") {
            blockcontext.showDeleteAlert = false;
        } else if(eventPayload.contentBlockId == "f5fcdd83ff13311001b9ffffffffffb8") {
            blockcontext.showDeactivateAlert = false;
        } else if (eventPayload.contentBlockId == "d93a994bff17311001b9ffffffffff55") {
            blockcontext.showCopyAlert = false;
        }
        await aceUtils.setContext(blockcontext);
    }
}
