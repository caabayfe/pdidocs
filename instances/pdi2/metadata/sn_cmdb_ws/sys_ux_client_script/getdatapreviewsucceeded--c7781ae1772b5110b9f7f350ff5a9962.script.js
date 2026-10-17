/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({ api, event, helpers, imports }) {

    let results = api.data.multisource_data_preview.output.result;
    let dataSources = [];
    results.reconciliationpreviewdata.forEach(function (previewData) {
        if (previewData.multi_source_values) {
            previewData.multi_source_values.forEach(function (source) {
                if (dataSources.indexOf(source.discovery_source) == -1) dataSources.push(source.discovery_source);
            });
        }
    });
    let attributes = [];
    results.reconciliationpreviewdata.forEach(function (previewData) {
        let newAttribute = { attribute: previewData.attribute, name: previewData.attribute_label, cmdb: previewData.golden_value, sources: {}, totalSources: 0 };
        if (previewData && previewData.multi_source_values) {
            let totalSources = 0;
            previewData.multi_source_values.forEach(function (source) {
                newAttribute.sources[source.discovery_source] = source.value;
                totalSources++;
            });
            newAttribute.totalSources = totalSources;
        }
        attributes.push(newAttribute);
    });
    attributes.sort((a, b) => (a.name > b.name) ? 1 : -1);
    api.setState('attributes', attributes);
    api.setState('sources', dataSources);
}
