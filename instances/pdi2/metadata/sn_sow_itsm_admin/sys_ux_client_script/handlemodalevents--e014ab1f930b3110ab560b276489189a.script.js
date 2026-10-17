
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
    if(eventName == "dismiss-modal") {
        aceUtils.dismissModal("3db7-28c4-abab89-c20f-9ba9b0bb");
    } else if (eventName == "modal-remove-clicked") {
        await aceUtils.refreshContentBlock("data_block_4");
        aceUtils.dismissModal("3db7-28c4-abab89-c20f-9ba9b0bb");
    }
}
