/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */

async function handler({api, event, helpers, imports}) {
    if (event.elementId === 'dismiss_btn') {
        api.emit('DISMISS_ACTION_CLICK', {sysId: api.state.customExpProps.sysId});
    }

    const state = api.state.state;
    const taskTable = api.state.taskTable;
    let completionMessage = '';
    const predictedIncident = api.context.props.customExpProps.previewFields[0].value.label;
    if (state == '6' || state == '7') {
        completionMessage = await helpers.translate("Resolution notes are copied from incident {0} and is also linked as parent.", [predictedIncident]);
    }
    else {
        if (taskTable.indexOf("Incident") != -1 || taskTable.indexOf("Incident Task") != -1) {
            completionMessage = await helpers.translate("Incident {0} is linked as parent.", [predictedIncident]);
        } else {
            completionMessage = await helpers.translate("Incident {0} is linked to {1} record.", [predictedIncident, taskTable.toLowerCase()]);
        }
    }

    // Decide which action to Emit based on state of predicted incident.
    // If state is 6, 7 then emit ON_SINGLE_CLICK_ACTION with actionMetadata of "Copy" action.
    // If state is other than 6,7 then emit ON_SINGLE_CLICK_ACTION with actionMetadata of "Link to incident"
    var callToActions = api.context.props.customExpProps.callToActions || [];
    var payload = null;
    for (var i in callToActions) {
        if (state == '6' || state == '7') {
            if (callToActions[i].name == "copy_resolution") {
                api.context.props.customExpProps.callToActions[i].primary = "true";
                api.context.props.customExpProps.callToActions[i].completionMessage = completionMessage;
                payload = {
                    sysId: api.context.props.customExpProps.sysId,
                    name: api.context.props.customExpProps.name,
                    actionStateValue: api.context.props.customExpProps.actionStateValue,
                    actionMetadata: api.context.props.customExpProps.callToActions[i]
                };
                break;
            }
        } else if (callToActions[i].name == "link_to_incident") {
            api.context.props.customExpProps.callToActions[i].primary = "true";
            api.context.props.customExpProps.callToActions[i].completionMessage = completionMessage;
            payload = {
                sysId: api.context.props.customExpProps.sysId,
                name: api.context.props.customExpProps.name,
                actionStateValue: api.context.props.customExpProps.actionStateValue,
                actionMetadata: api.context.props.customExpProps.callToActions[i]
            };
            break;
        }
    }

    if (api.context.props.customExpProps && api.context.props.customExpProps.useCase == "search") {
        api.emit(
            "ON_SINGLE_CLICK_ACTION_INITIATE", {
                table: api.context.props.customExpProps.table,
                tableSysId: api.context.props.customExpProps.tableSysId,
                actionType: api.context.props.customExpProps.actionTypeSysId,
                actionInputs: api.context.props.customExpProps.actionInputs,
                actionId: api.context.props.customExpProps.actionId
            });
    } else {
        api.emit(
            "ON_SINGLE_CLICK_ACTION", payload);
    }
}
