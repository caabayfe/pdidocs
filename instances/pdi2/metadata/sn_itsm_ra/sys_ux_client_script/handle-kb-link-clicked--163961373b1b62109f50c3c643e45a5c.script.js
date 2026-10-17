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
    const {
        customExpProps = null
    } = api.state;

    if (!customExpProps || !customExpProps.actionInputs || !customExpProps.actionInputs.citations) {
        return;
    }

    const citationsStr = customExpProps.actionInputs.citations;
    if (typeof citationsStr !== "string" || citationsStr.trim() === "") {
        return;
    }

    const citationsData = JSON.parse(citationsStr);

    if (!event || !event.context || !event.context.item || !event.context.item.value) {
        return;
    }
    const kbNumber = event.context.item.value.label;
    if (!kbNumber) {
        return;
    }

    var sys_id = "";
    for (var i = 0; i < citationsData.length; i++) {
        var citation = citationsData[i];
        if (citation && citation.number === kbNumber) {
            sys_id = citation.sys_id || "";
            break;
        }
    }

    if (!sys_id) {
        return;
    }

    customExpProps.formFieldInputs = {
        knowledge: sys_id
    };

    var actionBehavior = "contextual_side_panel";
    var actionStateValue = api.state.actionStateValue;

    if (actionStateValue == 'completed' && actionBehavior) {
        const {
            sysId,
            name,
            actionStateValue,
            attributes,
            renderer
        } = api.state.customExpProps;

        api.emit('ON_DRILL_DOWN_ACTION', {
            sysId: sysId,
            name: name,
            actionStateValue: actionStateValue,
            actionBehavior: actionBehavior,
            selectedActionAttributes: attributes,
            renderer: renderer,
        });
    } else {
        var actionMetadata = {
            actionBehavior: actionBehavior
        };
        api.emit("ON_DRILL_DOWN_ACTION_INITIATE", {
            ...customExpProps,
            actionMetadata: actionMetadata,
            actionType: customExpProps.actionTypeSysId
        });
    }
}
