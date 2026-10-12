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
    function saveUiAction(varSetData, payload) {
        api.data.save_ui_action_state.execute(payload);
        api.emit("ACE_ACTION_PERFORMED", {
            eventName: 'SN_NS_ADMIN_SAVE_VAR_SET_DATA',
            eventPayload: {
                forceSave: true
            }
        });
        api.emit("ACE_ACTION_PERFORMED", {
            eventName: 'SN_NS_ADMIN_REMOVE_OVERRIDE_SAVE'
        });
    }

    api.emit("ACE_ACTION_PERFORMED", {
        eventName: 'SN_NS_ADMIN_OVERRIDE_SAVE',
        eventPayload: {
            overrideFunction: saveUiAction,
            payload: {
                uiActionId: api.context.props.payload.guided_context.ui_action_id,
                state: event.name === "NOW_TOGGLE#CHECKED_SET" ? event.payload.value : api.state.uiActionActive,
                roles: (event.name === "NOW_TYPEAHEAD_MULTI#SELECTED_ITEMS_SET" ? event.payload.value : api.state.defaultUIActionRoles).map(role => role.sys_id)
            }
        }
    });
}
