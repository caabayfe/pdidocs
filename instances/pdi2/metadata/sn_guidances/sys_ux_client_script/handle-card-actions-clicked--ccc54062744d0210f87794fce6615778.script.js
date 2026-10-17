/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (event.elementId === 'dismiss_btn') {
        api.emit('DISMISS_ACTION_CLICK', {sysId: api.state.customExpProps.sysId});
    }
    api.emit('ON_SINGLE_CLICK_ACTION', {
        action: event.payload.action,
        cardData: api.context.props.cardProps
    });
}
