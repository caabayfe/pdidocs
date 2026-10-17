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
    if (event.elementId === "cancel") {
        helpers.modal.close();
    } else if (event.elementId === "save") {
        const commMgmtUXFBaseUtil = imports["sn_uib_tcm.CommunicationManagementUXFClientBaseUtil"]();
        const {
            existingRecipients,
            allSelectedRecipients,
            selectedCommPlan
        } = api.state;
        const initialData = api.data.get_initial_data.output;
        const sourceTable = (initialData && initialData.sourceTable) ? initialData.sourceTable : null;
        if (!existingRecipients || !allSelectedRecipients || !selectedCommPlan || !selectedCommPlan.id || !sourceTable) return;
        const {
            addList,
            deleteList
        } = commMgmtUXFBaseUtil.evaluateAddDeleteRecipientList(existingRecipients, allSelectedRecipients);
        commMgmtUXFBaseUtil.processAddRecipientList(addList);
        commMgmtUXFBaseUtil.processDeleteRecipientList(deleteList);
        try {
            const url = "/api/sn_comm_management/task_communication_management/comm_plan/" + selectedCommPlan.id + "/recipients?sysparm_table=" + sourceTable;
            const response = await helpers.snHttp(url, {
                method: 'POST',
                batch: false,
                body: {
                    recipients: {
                        add_list: addList,
                        delete_list: deleteList
                    }
                }
            });
            api.data.get_recipients_for_comm_plan.refresh();
            helpers.modal.close();
            if (api.context.props.type == "communicationTask") {
                if (api.context.props.origin == "headerAction") {
                    api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
                        event: 'Recipients Managed',
                        value: {
                            type: "Communication Task",
                            context: "Header Action"
                        }
                    });
                } else if (api.context.props.origin == "record") {
                    api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
                        event: 'Recipients Managed',
                        value: {
                            type: "Communication Task",
                            context: "Record"
                        }
                    });
                } else if (api.context.props.origin == "playbook") {
                    api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
                        event: 'Recipients Managed',
                        value: {
                            type: "Communication Task",
                            context: "Playbook"
                        }
                    });
                }
            }
            else if (api.context.props.type == "collaborationTask") {
                if (api.context.props.origin == "record") {
                    api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
                        event: 'Recipients Managed',
                        value: {
                            type: "Collaboration Task",
                            context: "Record"
                        }
                    });
                } else if (api.context.props.origin == "playbook") {
                    api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
                        event: 'Recipients Managed',
                        value: {
                            type: "Collaboration Task",
                            context: "Playbook"
                        }
                    });
                }
            }
        } catch (err) {
            api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                items: [{
                    id: "error-message",
                    action: {
                        type: "dismiss"
                    },
                    content: {
                        type: "html",
                        value: "<div>" + err.error.data.error.message + "</div>"
                    },
                    status: "critical"
                }]
            });
        }
    }
}
