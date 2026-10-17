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
    } else if (event.elementId === "save_or_compose") {
        const commMgmtUXFBaseUtil = imports["sn_uib_tcm.CommunicationManagementUXFClientBaseUtil"]();
        let response;
        const {
            whenToSendCommunication,
            allSelectedRecipients,
            shortDescription,
            frequency,
            dueIn,
            selectedChannelsList
        } = api.state;
        const {
            table,
            sysId
        } = api.context.props;
        if (!Array.isArray(allSelectedRecipients) || !shortDescription || !frequency || !Array.isArray(selectedChannelsList) || !table || !sysId)
            return;

        const recipients = [];
        allSelectedRecipients.forEach(function(recipient) {
            recipients.push({
                can_manage: true,
                isNew: true,
                type: {
                    value: recipient.type
                },
                responsibility: {},
                [commMgmtUXFBaseUtil.CONSTANTS.CONTACT_TYPE_COLUMN_MAP[recipient.type]]: {
                    value: recipient.id,
                    display_value: recipient.label
                }
            });
        });
        const reqBody = {
            commPlan: {
                source: sysId,
                short_description: shortDescription,
                comm_plan_type: "",
                recipients: recipients
            },
            commTask: {
                communication_frequency: frequency,
                comm_task_type: "",
                comm_plan: -1,
                short_description: shortDescription,
                due_in: dueIn
            },
            recipients: {
                add_list: recipients,
                delete_list: []
            },
            channels: selectedChannelsList
        };
        try {
            const url = "/api/sn_comm_management/task_communication_management/adhoc/comm_plan?sysparm_table=" + table;
            response = await helpers.snHttp(url, {
                method: 'POST',
                batch: false,
                body: reqBody
            });

            if (whenToSendCommunication === "later" && response.response.result && api.context.props.isParentRecordAware) {
                api.emit("GFORM#ADD_INFO_MESSAGE", {
                    message: await helpers.translate("New communication successfully created and added to the Upcoming section.")
                });
            }

            helpers.modal.close();
            if (api.context.props.origin == "headerAction") {
                api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
                    event: 'Ad Hoc Communication Created',
                    value: {
                        type: "Communication Task",
                        context: "Header Action"
                    }
                });
            } else if (api.context.props.origin == "emptyState") {
                api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
                    event: 'Ad Hoc Communication Created',
                    value: {
                        type: "Communication Task",
                        context: "Empty State Action"
                    }
                });
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

        if (whenToSendCommunication === "now") {
            api.emit('NAV_ITEM_SELECTED', {
                "route": "task-comm",
                "targetRoute": "current",
                "title": await helpers.translate("New Communication"),
                "fields": {
                    "table": table,
                    "sysId": response.response.result,
                    "commTaskTable": api.data.getcommtasktable.output
                }
            });
        }
    }
}
