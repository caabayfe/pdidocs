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
            trackEvent(event.payload, 'event');
            api.emit('ACE_ACTION_PERFORMED_RELAY_cf3d4cc0c33101104b8e88c7c840ddd8', {
                eventName: api.context.props.payload.props_details.event_name,
                eventPayload: {
                    ...updatedProps
                }
            });
            break;
        case 'auto':
        default:
            trackEvent(event.payload, 'auto');
            api.data.ace_set_control.execute({
                payload: updatedProps
            });
    }

    function trackEvent(data, saveMode) {

        const {telemetryData} = api.context.props.payload;

        if (telemetryData && telemetryData.disable)
            return;
        
        if (data && data.old_value  && data.new_value) {
            let payload = {
                table: data.table || '',
                sysid: data.sys_id || '',
                type: 'record',
                saveMode: saveMode,
                previousValue: data.old_value || '',
                updatedValue: data.new_value || '',
                field_name: data.field_name || ''
            }
            
            if (telemetryData && telemetryData.append_to_payload)
                payload = {
                    ...payload,
                    ...telemetryData.append_to_payload
                }
            
            api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
                event: 'Update Control Card',
                value: {
                    payload
                }
            });
        } 
    }
}
