/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({api, event, helpers, imports}) {
    const DELAY_MODAL_CLOSURE_MILLISECONDS = 1000;
    const LOADER_MODAL_ID = 'custom_loader_modal';
    const CHAT_CARD_ACTION_BUTTON_ID = 'chat_action_button';
    const GET_USERS_IN_COMM_PLAN_DATA_RESOURCE_ID = 'get_users_in_communication_plan';

    const openLoader = () => helpers.modal.open(LOADER_MODAL_ID);
    const closeLoader = () => helpers.modal.close(LOADER_MODAL_ID);

    const viewWorkbench = () => {
        api.emit('NAV_ITEM_SELECTED', {
            route: null,
            fields: null,
            params: null,
            redirect: null,
            passiveNavigation: null,
            title: null,
            multiInstField: null,
            targetRoute: null,
            external: {
                url: '$major_incident_workbench.do?sysparm_stack=no&sysparm_sys_id=' + api.context.props.sysId
            },
            navigationOptions: null
        });
    };

    const openTeamsChatModal = (table, sys_id, participants) => {
        api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', {
            viewportElementId: "modal_viewport_chat",
            route: "start-msteams-chat-modal",
            fields: null,
            params: {
                table: table,
                sysId: sys_id,
                descriptionField: "short_description",
                preSelectedParticipants: participants.join(",")
            }
        });
    };

    const openSidebarDiscussionModal = (table, sys_id, participants) => {
        api.emit('RECORD#OPEN_COLLAB_CHAT', {
            fields: {
                "parentTable": table,
                "parentSysId": sys_id,
                "config": {
                    'participants': participants,
                    'prefill': false,
                    'isPermissionCheckNeeded': false // Permission check is done at the data broker
                }
            }
        });
    };

    switch (event.elementId) {
        case CHAT_CARD_ACTION_BUTTON_ID:
            const commTask = event.context.item.value;
            if (commTask.is_slack_collaboration) viewWorkbench();
            if (commTask.is_teams_collaboration || commTask.is_sidebar_collaboration) {
                const modalText = commTask.is_teams_collaboration ? await helpers.translate("Adding required participants to the chat") : await helpers.translate("Adding required participants to the discussion");
                api.setState("customModalText", modalText);
                openLoader();
                api.setState('selectedCommTask', {
                    comm_plan: {
                        sys_id: commTask.comm_plan_sys_id
                    },
                    comm_task: {
                        table: commTask.table,
                        sys_id: commTask.sys_id,
                        is_teams_collaboration: commTask.is_teams_collaboration,
                        is_sidebar_collaboration: commTask.is_sidebar_collaboration
                    },
                    timestamp: Date.now()
                });
            }
            break;
        case GET_USERS_IN_COMM_PLAN_DATA_RESOURCE_ID:
            let {comm_task} = api.state.selectedCommTask;
            let {users} = api.data.get_users_in_communication_plan.output;
            let participants = (event.name === 'DATA_FETCH_SUCCEEDED' && users ? users : []);
            if (comm_task.is_sidebar_collaboration) openSidebarDiscussionModal(comm_task.table, comm_task.sys_id, participants);
            else openTeamsChatModal(comm_task.table, comm_task.sys_id, participants)
            helpers.timing.setTimeout(closeLoader, DELAY_MODAL_CLOSURE_MILLISECONDS);   // Delayed loader modal closure for smooth transition
            break;
        default:
            // no operation
    }
}
