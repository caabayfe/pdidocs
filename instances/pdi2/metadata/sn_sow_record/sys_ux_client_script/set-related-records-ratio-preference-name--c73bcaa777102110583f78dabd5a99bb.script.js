/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
        const PREFIX = "sow.layout.related_records_ratio.";
        const table = api.context.props.parentTable || 'global';
        const relatedRecordsRatioPreference = PREFIX + table;
        api.setState('relatedRecordsRatioPreference', relatedRecordsRatioPreference);
}
