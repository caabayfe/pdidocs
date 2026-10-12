/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
console.log(event.payload.data.elements[0]);
let installedParam = true;
if(event.payload.data.elements[0]=="Not installed"){
    installedParam = false;
    api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
        event: 'Not Installed - Plugin Status',
        value: {card : 'Now Assist Summary'}
    });
}
let now = Date.now();
helpers.navigate.to('plugins', {}, {'installed':installedParam,'t':now}, false, false);
}
