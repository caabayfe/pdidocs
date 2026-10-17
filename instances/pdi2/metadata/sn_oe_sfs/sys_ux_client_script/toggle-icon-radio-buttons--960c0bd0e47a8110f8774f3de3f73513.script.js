/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if(event.payload.value == 'custom') {
        api.setState('iconRadioButtonState', [{"id":"default","label":"Use default icon"},{"id":"custom","label":"Use custom icon", "checked": true}]);
        api.setState('botIconDefault', false);
    } else {
        api.setState('iconRadioButtonState', [{"id":"default","label":"Use default icon","checked": true},{"id":"custom","label":"Use custom icon"}]);
        api.setState('botIconDefault', true);
    }
}
