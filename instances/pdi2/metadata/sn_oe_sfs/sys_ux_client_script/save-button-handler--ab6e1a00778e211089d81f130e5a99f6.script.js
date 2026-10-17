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
    api.data.ace_set_control.execute({
        payload: api.state.currentControlState
    });
    const {telemetryData} = api.context.props.payload;

    if (telemetryData && telemetryData.disable)
        return;
    
    //Adding Event Tracking from Save button click
    if (api.state.currentControlState) {
        let controlCardValues = Object.values(api.state.currentControlState);
        if (controlCardValues && controlCardValues.length > 0) {
            controlCardValues.forEach((controlCardValue, index) => {
                let controlType = '';
                const {payload} = api.context.props;
                if (payload.children && payload.children.length > 0) {
                    let child = payload.children[index];
                    controlType = child.props_details.control_type;
                    //controlType = api.context.props.payload.children[index].props_details.control_type;
                }
                let eventPayload = {
                    table: controlCardValue.table || '',
                    sysid: controlCardValue.sys_id || '',
                    type: controlType || '',
                    saveMode: payload.props_details.save_mode || '',
                    previousValue: controlCardValue.old_value || '',
                    updatedValue: controlCardValue.new_value || ''
                }
                if (telemetryData &&
                    telemetryData.append_to_payload)
                    eventPayload = {
                        ...eventPayload,
                        ...telemetryData.append_to_payload
                    }
                
                api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
                    event: 'Update Control Card',
                    value: {
                        eventPayload
                    }
                });
            });
        }
    }


}
