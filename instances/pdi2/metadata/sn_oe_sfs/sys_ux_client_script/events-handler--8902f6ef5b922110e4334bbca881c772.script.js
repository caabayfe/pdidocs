/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
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
    var blockcontext = eventPayload.blockcontext;
    var channelTeams = "a812eaf8c32111100f24c87af040dd59";
    //state variables --> aceContents, blockcontext
    //Default Client Scripts to handle updates to aceContents and blockcontext should be in App Shell
    switch (eventName) {
        case 'groups_selected':
            blockcontext.showAlert = false;
            var index = 0;
            var selected = [];
            while (eventPayload[index]) {
                selected.push(eventPayload[index]);
                index++;
            }
            blockcontext.groupSelectedItems = selected;
            publish();
            break;
        case 'users_selected':
            blockcontext.showAlert = false;
            var index = 0;
            var selected = [];
            while (eventPayload[index]) {
                selected.push(eventPayload[index]);
                index++;
            }
            blockcontext.userSelectedItems = selected;
            publish();
            break;
        case 'groups_condition':
            blockcontext.showAlert = false;
            blockcontext.groupCondition = eventPayload.value;
            break;
        case 'users_condition':
            blockcontext.showAlert = false;
            blockcontext.userCondition = eventPayload.value;
            break
        case 'group_apply_filter':
            blockcontext.showAlert = false;
            callUtilAPI({
                operation: 'GROUP_FILTER',
                channel: channelTeams,
                items: blockcontext.groupCondition
            });
            break;
        case 'user_apply_filter':
            blockcontext.showAlert = false;
            callUtilAPI({
                operation: 'USER_FILTER',
                channel: channelTeams,
                items: blockcontext.userCondition
            });
            break;
        case 'save':
            blockcontext.showAlert = false;
            var currentGroups = blockcontext.groupItemsLoaded.map(getItems);
            var newGroups = blockcontext.groupSelectedItems.map(getItems);
            var groupsToCreate = getHaveToCreateItems(currentGroups, newGroups);
            var groupsToDelete = getHaveToDeleteItems(currentGroups, newGroups);
            var currentUsers = blockcontext.userItemsLoaded.map(getItems);
            var newUsers = blockcontext.userSelectedItems.map(getItems);
            var usersToCreate = getHaveToCreateItems(currentUsers, newUsers);
            var usersToDelete = getHaveToDeleteItems(currentUsers, newUsers);
            var finalItems = {
                groupToCreate: groupsToCreate,
                groupToDelete: groupsToDelete,
                userToCreate: usersToCreate,
                userToDelete: usersToDelete
            };
            callUtilAPI({
                operation: 'INSERT_DELETE_RECORDS',
                channel: channelTeams,
                items: finalItems
            });
            break;
        case 'dismiss_alert':
            blockcontext.showAlert = false;
            publish();
        default:
    }

    function callUtilAPI(body) {
        return helpers.snHttp('/api/sn_oe_sfs/sidebar_teams_permission_api/util', {
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

    function getItems(value) {
        return value[0].id;
    }

    function getHaveToCreateItems(currentItems, newItems) {
        return newItems.filter((x) => !currentItems.includes(x));
    }

    function getHaveToDeleteItems(currentItems, newItems) {
        return currentItems.filter((x) => !newItems.includes(x));
    }

    function callbackHandler(body, response) {
        switch (body.operation) {
            case 'INSERT_DELETE_RECORDS':
                var message = response.result.message
                blockcontext.alertVarient = "positive";
                if (response.result.error)
                    blockcontext.alertVarient = "critical";
                blockcontext.showAlert = true;
                blockcontext.alertMessage = message;
                blockcontext.groupCondition = "";
                blockcontext.userCondition = "";
                publish();
                callUtilAPI({
                    operation: 'GROUP_FILTER',
                    channel: channelTeams,
                    items: blockcontext.groupCondition
                });
                callUtilAPI({
                    operation: 'USER_FILTER',
                    channel: channelTeams,
                    items: blockcontext.userCondition
                });
                break;
            case 'GROUP_FILTER':
                blockcontext.groupItems = response.result.items.availableResult;
                blockcontext.groupItemsLoaded = response.result.items.selectedResult;
                publish();
                break;
            case 'USER_FILTER':
                blockcontext.userItems = response.result.items.availableResult;
                blockcontext.userItemsLoaded = response.result.items.selectedResult;
                publish();
                break;
        }
    }
    
    function publish() {
        aceUtils.setContext(blockcontext);
    }
}
