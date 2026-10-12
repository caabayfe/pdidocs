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

    if (api.data.record_information.output && api.data.record_information.output.incidentInfo) {
        var modalOpen = (api, modalTitle) => {
            api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', {
                viewportElementId: 'modal_viewport',
                route: 'sowformmodalv2',
                fields: {
                    table: api.context.props.recordTable,
                    sysId: api.context.props.recordSysId,
                    title: "",
                    view: "sow_incident_assign_modal"
                },
                params: {
                    "parentFormFields": JSON.stringify(api.context.props.fields),
                    "isGFormSave": "true",
                    "onclickAppseeEvent": "Click Reassign Modal Action",
                    "modalTitle": modalTitle
                }
            });
        };

        var actionLabel = "";
        var title; 

        if ((api.data.record_information.output.incidentInfo.assignmentGroup && api.data.record_information.output.incidentInfo.assignedTo) ||
            event.elementId === 'reassign_button' || api.data.record_information.output.incidentInfo.assignedTo) {
            title = await helpers.translate("Reassign");
            modalOpen(api, title);
            actionLabel = "Reassign";
        } else if (api.state.recordInfoPrimaryDetails.userhasGrp || (!api.data.record_information.output.incidentInfo.assignmentGroup && !api.data.record_information.output.incidentInfo.assignedTo)) {
            api.emit('SOW_RECORD_UI_ACTION#EXECUTE_UI_ACTION', {
                actionSysId: "8513fcd0773b301027aae297cd5a9968"
            });
            actionLabel = "Assign to me";
        } else {
            title = await helpers.translate("Assign");
            modalOpen(api, title);
            actionLabel = "Assign";
        }

        if (actionLabel) {
            api.emit("MACROPONENT_TRACK_USAGE_REQUESTED", {
                event: "Assign/Reassign Incident",
                value: {
                    action: actionLabel,
                    origin: "Requester Info Sidebar"
                }
            });
        }
    }
}
