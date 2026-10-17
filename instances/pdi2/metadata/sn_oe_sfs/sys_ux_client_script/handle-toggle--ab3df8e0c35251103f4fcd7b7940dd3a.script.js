/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var toggleValue = event.payload.value;
    api.setState('isTeamsEnabled', toggleValue);

    if (toggleValue !== api.state.toggleValue) {
        api.emit('SCREEN_STATUS_CHANGED', {
            isDirty: true
        });
    } else {
        api.emit('SCREEN_STATUS_CHANGED', {
            isDirty: false
        });
    }
    if (toggleValue === false) {
        api.setState('showToggleModal', true);
    } else {
        api.setState('showToggleModal', false);
    }
}
