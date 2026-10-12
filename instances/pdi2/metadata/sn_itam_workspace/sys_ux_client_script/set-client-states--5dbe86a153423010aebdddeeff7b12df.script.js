/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    var value = event.payload.value;
    if(event.elementId === 'asset_tag'){
        api.setState('assetTag', value);
    }
    else if(event.elementId === 'serial_number'){
        api.setState('serialNumber', value);
    }   
    else if(event.elementId === 'select_user'){
        api.setState('reservedFor', value);
    }
}
