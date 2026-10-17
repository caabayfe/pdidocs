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
    var status = event?.payload?.data?.output?.status;
    var provider = api.state.currentCapablityGroup?.providers?.filter(i=>i.id===api.state.currentCapablityGroup?.selectedProvider)[0]?.label;
    var group = api.state.capabilityGroups.filter(i=>i.sys_id===api.state.currentCapablityGroup?.sys_id)[0]?.header;
    if (status === "Success") {
        updateCapabilityGroupData();
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: [{
                id: "manage_llm_success_alert",
                status: "positive",
                icon: "info-circle-outline",
                content: {
                    type: "html",
                    value: await helpers.translate("You've enabled {0} for {1}.",provider,group)
                },
                action: {
                    type: 'dismiss'
                }
            }]
        });
    } else if (status === "Partial") {
        updateCapabilityGroupData();
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: [{
                id: "manage_llm_partial_success_alert",
                status: "info",
                icon: "exclamation-triangle-outline",
                content: {
                    type: "html",
                    value: await helpers.translate("Some of the skills updated, while others failed.")
                },
                action: {
                    type: 'dismiss'
                }
            }]
        });
    } else {
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: [{
                id: "manage_llm_error_alert",
                status: "critical",
                icon: "exclamation-triangle-outline",
                content: {
                    type: "html",
                    value: await helpers.translate("None of the skill is updated.")
                },
                action: {
                    type: 'dismiss'
                }
            }]
        });
    }

    function updateCapabilityGroupData() {
        var capabilityGroupPrevDataChange = api.state.prevCapabilityGroup;
        capabilityGroupPrevDataChange[api.state.currentCapablityGroup.sys_id] = api.state.currentCapablityGroup.selectedProvider;
        api.setState("prevCapabilityGroup", capabilityGroupPrevDataChange);
        var data = [...api.state.capabilityGroups];
        data.find(i => i.sys_id === api.state.currentCapablityGroup.sys_id).enableSave = false;
        api.setState("capabilityGroups",data);

    }
}
