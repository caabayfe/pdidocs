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
        if(eventPayload.contentBlockId == "93f40562ffa3311001b9ffffffffff59") {
            blockcontext.showActivateAlert = false;
        } else if(eventPayload.contentBlockId == "ff26cda2ffa3311001b9ffffffffff10") {
            blockcontext.showDeleteAlert = false;
        } else if(eventPayload.contentBlockId == "20154562ffa3311001b9ffffffffff7d") {
            blockcontext.showDeactivateAlert = false;
        } else if (eventPayload.contentBlockId == "0fa78926ffa3311001b9ffffffffffc1") {
            blockcontext.showCreateOrEditAlert = false;
        } else if (eventPayload.contentBlockId == "2b25c162ffa3311001b9ffffffffff68") {
            blockcontext.showCopyAlert = false;
        }
        await aceUtils.setContext(blockcontext);
    }
}
