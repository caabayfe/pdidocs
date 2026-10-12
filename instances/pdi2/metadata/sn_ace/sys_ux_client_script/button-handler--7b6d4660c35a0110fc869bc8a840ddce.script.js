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
    try{
        const {title, subtitle, type, button_data: { label, event_name}} = api.context.props.controlProps;
        
        api.emit('ACE_CONTROL_BUTTON_CLICK', {
            event_name,
            label,
            type,
            title, 
            subtitle
        });
    }
    catch(e){
        console.log("Error emitting control card button click event", e);
    }
}
