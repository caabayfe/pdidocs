/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const urlUsed = api.data.look_up_bot_icon.results[0].value.value != null && api.data.look_up_bot_icon.results[0].value.value != "null";
    const imageUsed = api.data.look_up_bot_image.results[0].image.value !=null && api.data.look_up_bot_image.results[0].image.displayValue != "";
    if(urlUsed) {
        api.setState('iconRadioButtonState', [{"id":"default","label":"Use default icon"},{"id":"custom","label":"Use custom icon", "checked": true}]);
        api.setState('botIconDefault', false);
        api.setState('botIcon', decodeURIComponent(api.data.look_up_bot_icon.results[0].value.value));
        api.setState('useImageUrl', true);
    } else if(imageUsed) {
        api.setState('iconRadioButtonState', [{"id":"default","label":"Use default icon"},{"id":"custom","label":"Use custom icon", "checked": true}]);
        api.setState('botIconDefault', false);
    } else {
        api.setState('botIconDefault', true);
        api.setState('iconRadioButtonState', [{"id":"default","label":"Use default icon","checked": true},{"id":"custom","label":"Use custom icon"}]);
    }
}
