/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    const { data } = event.payload;
    if (!data.intentId)
        console.error('Somehow, we got a message, but no intent!');

    api.emit('OPEN_WORKBENCH', {
        view: {
            left: {
                filters: {
                    intentId: data.intentId,
                },
            },
            right: null,
        },
    });
}
