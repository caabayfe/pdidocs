/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    api.setState('tabsMetadata', [{
        label: await helpers.translate('Data ingestion'),
        productCategory: 'data_ingestion'
    }, {
        label: await helpers.translate('Data governance'),
        productCategory: 'data_governance'
    }, {
        label: await helpers.translate('Search & analytics'),
        productCategory: 'search_and_analytics'
    }]);
}
