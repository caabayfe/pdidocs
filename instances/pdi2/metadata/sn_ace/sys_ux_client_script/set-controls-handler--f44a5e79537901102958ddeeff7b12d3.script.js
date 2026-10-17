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
        sys_id,
        old_value,
        new_value,
        table,
        field_name
    } = event.payload;
    const updatedProps = {};
    updatedProps[sys_id] = {
        sys_id,
        old_value,
        new_value,
        table,
        field_name
    };

    switch (api.context.props.payload.props_details.save_mode) {
        case 'button':
            let {
                currentControlState
            } = api.state;
            currentControlState = { ...currentControlState,
                ...updatedProps
            };
            api.setState('currentControlState', currentControlState);
            break;
        case 'event':
            api.emit('ACE_ACTION_PERFORMED_RELAY_cf3d4cc0c33101104b8e88c7c840ddd8', {
                eventName: api.context.props.payload.props_details.event_name,
                eventPayload: {
                    ...updatedProps
                }
            });
            break;
        case 'auto':
        default:
            api.data.ace_set_control.execute({
                payload: updatedProps
            });
    }
}
