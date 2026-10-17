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
    let {
        name,
        value,
        item
    } = event.payload;
    const isNewNotification = event?.context?.item?.value?.new_notification;
    const policyActionSysId = event?.context?.item?.value?.policy_action_sysId;
    let glideVariablesValue = api?.state?.glideVariablesValue;
    let data = {};
    let column, tableToUpdate;
    let nameObj = name.split(",");
    name = nameObj[0];
    column = nameObj[1];
    tableToUpdate = nameObj[2];

    // When a value is selected from a single select typeahead component, it spits out the payload in the "item" key
    if (!Array.isArray(value)) {
        value = [item];
    }

    /**
    * The 'index' needs to be applied, as unique key (model_id) gets overwritten otherwise when we add same type notification more than once
    * This address for more than one param change inside a given condition/notifications
    * When we have more than one param inside a single condition/notification
    */
    var index = event?.context?.item?.parent?.index;
    if (index != 0 && !index) {
        index = event?.context?.item?.index;
    }
    name = name + "_" + index;
    if (glideVariablesValue[name]) {
        data = glideVariablesValue[name];
        data = {
            [name]: {
                ...glideVariablesValue[name],
                [column]: {
                    [column]: column,
                    "value" : value,
                    "tableToUpdate" : tableToUpdate
                }
            }
        }
    } else {
        // Create the object if the change has been capture for the first time
        data = {
            [name]: {
                [column]: {
                    [column]: column,
                    "value" : value,
                    "tableToUpdate" : tableToUpdate
                },
                "policy_action_sys_id" : policyActionSysId,
                "create_new_entry" : isNewNotification
             }
        }
    }

    // Update the existing payload object so we can send it out at once to the backend
    const glideVariables = {
        ...api.state.glideVariablesValue,
        [name]: data[name]
    };
    api.setState('glideVariablesValue', glideVariables);
}
