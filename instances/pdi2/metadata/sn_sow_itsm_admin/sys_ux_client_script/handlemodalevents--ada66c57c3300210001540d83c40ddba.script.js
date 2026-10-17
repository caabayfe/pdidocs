
/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    //Following import statement is boiler-plate code for ACE client scripts. Please do not manipulate the next line.
    const aceUtils = imports["sn_ace.ACEClientScriptUtils"](api, helpers);

    const {
        eventName,
        eventPayload
    } = event.payload;

    //state variables --> aceContents, blockcontext
    var blockcontext = await aceUtils.getContext();

    //Default Client Scripts to handle updates to aceContents and blockcontext should be in App Shell
    if (eventName === "modal-assign-clicked") {
        let msgs = {
            "items": []
        };
        let message = await helpers.translate("No playbook(s) selected");
        let failureMessage = await helpers.translate("Unable to assign playbooks");
        
        //refresh left panel after assigning selected playbook ids
        await aceUtils.refreshContentBlock('assign_playbooks_to_mim');

        //dismiss the confirmation modal
        aceUtils.dismissModal("521a-5a66-89888b-db1e-8b896f8b");
        
        //get the latest context
        blockcontext = await aceUtils.getContext();

        let response = blockcontext.assignPlaybooksResponse;

        if (response.noOfValidPlaybookIds > 0) {
            message = await helpers.translate("{0} playbook(s) have been assigned to MIM",[response.noOfValidPlaybookIds]);
            failureMessage = await helpers.translate("Failed to assign {0} playbook(s) to MIM, please try again later",[response.noOfValidPlaybookIds]);
        };

        //refresh tabs data after assigning selected playbook ids
        await aceUtils.refreshContentBlock('get_playbooks_data');

        //refresh right panel after assigning selected playbook ids
        await aceUtils.refreshContentBlock('get_mim_playbook_data');

        blockcontext = await aceUtils.getContext();

        if (response.updateStatus === true) {
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
