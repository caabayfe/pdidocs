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
    var payload = api.state.changedPayload;
    if (event.elementId == "textarea_1") {
        var sysId = api.state.selectedPayload.task.indicator_id;

        if (!payload[sysId] || (payload[sysId].description != event.payload.value)) {
            payload[sysId] = {
                "description": event.payload.value,
                "condition": payload[sysId].condition
            };
        }

    } else if (event.elementId == "textarea_3") {
        var item = event.context.item;

        if (!payload[item.value.sys_id] || (payload[item.value.sys_id].description != event.payload.value)) {
            payload[item.value.sys_id] = {
                "description": event.payload.value,
                "condition": payload[item.value.sys_id].condition
            };
        }

    } else if (event.elementId == "condition_builder_1") {
        var item = event.context.item;

        if (!payload[item.value.sys_id] || (payload[item.value.sys_id].condition != event.payload.value)) {
            if (payload[item.value.sys_id] && payload[item.value.sys_id].description) {
                payload[item.value.sys_id] = {
                    "description": payload[item.value.sys_id].description,
                    "condition": event.payload.value
                };
            } else {
                payload[item.value.sys_id] = {
                    "condition": event.payload.value
                };
            }
        }
    }
    api.setState("changedPayload", payload);

    let originalKPIInfo = api.state.selectedPayload.task;

    if (originalKPIInfo.description.value != payload[originalKPIInfo.indicator_id].description) {
        api.setState("disableSaveBtn", false);
        return;
    } else {
        for (let item of originalKPIInfo.child_kpis) {
            if (item.description.value != payload[item.sys_id].description) {
                api.setState("disableSaveBtn", false);
                return;
            }

            if (item.conditions.value.endsWith("^EQ") && !payload[item.sys_id].condition.endsWith("^EQ")) {
                payload[item.sys_id].condition += "^EQ";
            }
            if (item.conditions.value != payload[item.sys_id].condition) {
                api.setState("disableSaveBtn", false);
                return;
            }
        }
    }

    api.setState("disableSaveBtn", true);
}
