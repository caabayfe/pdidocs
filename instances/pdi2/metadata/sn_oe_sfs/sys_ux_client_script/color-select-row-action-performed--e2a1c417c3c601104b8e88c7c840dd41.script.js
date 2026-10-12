/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const eventPayload = {
        'open_color_picker': false,
        'key': api.context.props.payload.name,
        'new_value': ''
    };
    switch(event.name){
        //the color fill button overlay clicked
        case 'NOW_BUTTON_ICONIC#CLICKED':
            eventPayload.open_color_picker = true;
            break;
        //input field value changed
        case 'NOW_INPUT#INPUT':
            eventPayload.new_value = event.payload.fieldValue;
            break;
        default: return;
    }
    api.emit('COLOR_SELECT_ROW_ACTION_PERFORMED', eventPayload);
}
