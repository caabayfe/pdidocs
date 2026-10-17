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
    
    var blockcontext = await aceUtils.getContext();
    //state variables --> aceContents, blockcontext
    //Default Client Scripts to handle updates to aceContents and blockcontext should be in App Shell
    if(eventName === "list-wrapped-action-clicked") {
        let actionId = eventPayload.wrappedAction;

        if (actionId === "ASSIGN_TO_MIM_BUTTON_CLICKED") {
            blockcontext.selectedRecords_assignPlaybookIds = eventPayload.wrappedPayload.sysIds;  
            await aceUtils.setContext(blockcontext);
            //open Assign playbooks modal to accept confirmation from user by clicking on Assign button
            //confirmation is to assign only active playbooks with published status to MIM
            aceUtils.openModal("521a-5a66-89888b-db1e-8b896f8b");
        } else if (actionId === "REMOVE_FROM_MIM_BUTTON_CLICKED") {
            let msgs = {
                "items": []
            };

            let playbookIds = blockcontext.selectedRecords_removePlaybookIds = eventPayload.wrappedPayload.sysIds;
            let playbooksCount = playbookIds.split(",").length;
            let message = await helpers.translate("{0} playbook(s) unassigned from MIM", [playbooksCount]);
            let failureMessage = await helpers.translate("Failed to unassign {0} playbook(s) from MIM, please try again later",[playbooksCount]);

            await aceUtils.setContext(blockcontext);
            
            //refresh left panel after assigning selected playbook ids
            await aceUtils.refreshContentBlock('remove_playbooks_from_mim');

            await aceUtils.refreshContentBlock('get_playbooks_data');

            //refresh right panel after assigning selected playbook ids
            await aceUtils.refreshContentBlock('get_mim_playbook_data');

            blockcontext = await aceUtils.getContext();

            if (blockcontext.updateStatus === true) {
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
    } else if(eventName === "open-record") {
        let viewDetailsUrl = '/now/workflow-studio/builder?tableName=sys_pd_process_definition&builderId=process&sysId=' + eventPayload.sys_id;
        api.emit('NAV_ITEM_SELECTED', {
            external: {
                url: viewDetailsUrl,
                target: '_blank'
            }
        });
    } else if(eventName === "refresh-list") {
        await aceUtils.refreshContentBlock('get_playbooks_data');
    }
}
