/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

const colTypeLabelMap = api.data.gliderecord_dictionary_query_1.output.colTypeLabelMap;

    const return_fields = api.state.return_fields;
    const return_fields_default = api.state.return_fields_default;

    var selectedCols = [], selectedColsDefault = [];

    return_fields.split(',').forEach((_field) => {
        selectedCols.push([{
            id: colTypeLabelMap[_field].key,
            label: colTypeLabelMap[_field].label
        }]);
    });

    return_fields_default.split(',').forEach((_field) => {
        selectedColsDefault.push([{
            id: colTypeLabelMap[_field].key,
            label: colTypeLabelMap[_field].label
        }]);
    });

    api.setState('colTypeLabelMap', colTypeLabelMap);
    api.emit('SET_SELECTED_COLUMNS', {
        selectedCols,
        selectedColsDefault
    });
}
