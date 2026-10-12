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

	const {eventName, eventPayload} = event.payload;
    var blockcontext = eventPayload.blockcontext;
    //state variables --> aceContents, blockcontext
    //Default Client Scripts to handle updates to aceContents and blockcontext should be in App Shell

    switch (eventName) {
        case 'apply_to_all_group_checked':
            blockcontext.showAlertMessage = false;
            blockcontext.applyToAllGroups = eventPayload.value;
            blockcontext.showGroupSelector = !blockcontext.applyToAllGroups;
            publish();
            break;
        case 'group_condition_set':
            blockcontext.showAlertMessage = false;
            blockcontext.groupCondition = eventPayload.value;
            break;
        case 'apply_group_filter':
            callAPI({
                operation: 'APPLY_GROUP_FILTER',
                item: blockcontext.groupCondition
            });
            break;
        case 'groups_selected':
            blockcontext.showAlertMessage = false;
            var index = 0;
            var selected = [];
            while (eventPayload[index]) {
                selected.push(eventPayload[index]);
                index++;
            }
            blockcontext.groupSelectedItems = selected;
            publish();
            break;
        case 'save_config':
            callAPI({
                operation: 'SAVE_CONFIG',
                allGroupsFlag: blockcontext.applyToAllGroups,
                items: blockcontext.groupSelectedItems
            });
            break;
        case 'dismiss_alert': 
            blockcontext.showAlertMessage = false;
            publish();
            break;
    }

    function callAPI(body) {
        return helpers.snHttp('/api/sn_oe_sfs/v1/sidebar_suggestions_permission_api/group', {
            method: 'POST',
            body: {
                ...body
            }
        }).then(response => {
            callbackHandler(body, response.response);
        }).catch(response => {
            try {
                console.log(body.operation + " failed: " + JSON.stringify(response.error));
            } catch (e) {
                console.log(body.operation + " failed: " + JSON.stringify(response));
            }
        });
    };
    
    function callbackHandler(body, response) {
        switch (body.operation) {
            case 'APPLY_GROUP_FILTER':
                blockcontext.groupItems = response.result.items.availableResult;
                publish();
                break;
            case 'SAVE_CONFIG': 
                blockcontext.showAlertMessage = true;
                blockcontext.alertMessage = response.result.message; 
                
                if (response.result.error)
                    blockcontext.alertVarient = "critical";
                else 
                    blockcontext.alertVarient = "positive";
                     
                publish();
                break;
        }
    }
    
    function publish() {
        aceUtils.setContext(blockcontext);
    }
}
