/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const eventName = event.name;
    const announceMessage = async () => {
        let message;
        switch(eventName) {
            case 'DATA_FETCH_INITIATED':
                message = await helpers.translate('Loading agenda');
                break;
            case 'DATA_FETCH_SUCCEEDED':
                message = await helpers.translate('Agenda loaded');
                break;
        };

        if (message)
            api.emit('SEISMIC_ARIA_LIVE_REGION_UPDATE_REQUESTED', {
                message,
                type: 'polite'
            });
    };

    announceMessage();
}
