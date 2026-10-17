/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    const {modal} = helpers;
    var toggle = event.payload.value;
    api.setState("masking_enabled", toggle);
    if (toggle == false){
        modal.open("[component-id$='confirm_1']");
        api.setState('toggleState',false);
        
    }
    else{
        api.setState('toggleState',true);
    }
}
