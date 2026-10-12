/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const text = event.payload.value;

    api.emit('NOW_PREDICATE_BUILDER#PREDICATE_ACTION', {
        eventName: 'UPDATE_PREDICATE_PROPERTIES',
        predicateProperties: {
            isConfigured: true
        }
    });
}
