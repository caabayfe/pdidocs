
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

    let blockcontext = await aceUtils.getContext();

	const {eventName, eventPayload} = event.payload;
    //state variables --> aceContents, blockcontext
    //Default Client Scripts to handle updates to aceContents and blockcontext should be in App Shell
    if(eventName == "save-button-clicked") {
        let msgs = {
                "items": []
        };
        let failureMessage = await helpers.translate("Failed to save default configuration, please try again later");
        let message = await helpers.translate("Default settings configured");

        await aceUtils.refreshContentBlock('data_block_2');
        blockcontext = await aceUtils.getContext();

        if (blockcontext.updateStatus) {
            let indexValue = -1;

            msgs.items.push({
                "id": "success-msg",
                "action": {
                    "type": "dismiss"
                },
                "content": message,
                "status": "positive",
                "icon": "info-circle-outline",
            });
        } else {
            msgs.items.push({
                "id": "failure-msg",
                "action": {
                    "type": "dismiss"
                },
                "content": failureMessage,
                "status": "critical",
                "icon": "info-circle-outline",
            });
        }
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', msgs);
    }
}
