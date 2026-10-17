/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    const announceSearchStatus = async (term) => {
        let message;
        switch (event.name) {
            case 'DATA_FETCH_INITIATED':
                message = (term === '' || term === '__firstInit')
                    ? await helpers.translate('Searching for all')
                    : await helpers.translate('Searching for {0}', [term]);
                break;
            case 'DATA_FETCH_SUCCEEDED':
                message = await helpers.translate('Search completed successfully');
                break;
        }
        api.emit('SEISMIC_ARIA_LIVE_REGION_UPDATE_REQUESTED', { message, type: 'polite' });
    };
    announceSearchStatus(api.state.attendeeSearchTerm);
}
