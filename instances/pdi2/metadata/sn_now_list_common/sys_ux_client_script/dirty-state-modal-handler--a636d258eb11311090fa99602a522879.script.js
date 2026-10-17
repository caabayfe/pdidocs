/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({ api, event, helpers, imports }) {
    const { action } = event.payload;
    api.emit('LIST_CTRL#CLOSE_MODAL', {actionType: action});
    if (action === 'cancel') {
        api.setState('callbackEvent', null);
    } else if (action === 'discard') {
        api.setState('isDirty', false);
        api.emit('LIST_CTRL#CLOSE_PANEL');
        const { callbackEvent } = api.state;
        if (callbackEvent) {
            const { name, payload } = callbackEvent;
            api.setState('callbackEvent', null);
            api.emit(name, payload);
        }
    }
}
