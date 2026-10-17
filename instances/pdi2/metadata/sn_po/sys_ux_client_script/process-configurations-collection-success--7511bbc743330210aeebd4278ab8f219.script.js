/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const response = api.data.gliderecord_collection_query_1.output.data.GlideRecord_Query.promin_process_def;
    const rows = response._results.map(item => ({
        key: item._row_data.uniqueValue,
        selectionDisabled: false,
        cells: {
            table: {
                value: item.table.value,
                label: item.table.displayValue
            },
            sys_updated_on: {
                value: item.sys_updated_on.displayValue,
                label: item.sys_updated_on.label,
                metadata: {
                    referenceSysId: null,
                    internalValue: item.sys_updated_on.displayValue,
                    internalType: "glide_date_time"
                }
            },
            sys_updated_by: {
                value: item.sys_updated_by.value,
                label: item.sys_updated_by.label,
                metadata: {
                    referenceSysId: null,
                    internalValue: item.sys_updated_by.displayValue,
                    internalType: item.sys_updated_by.internalType
                }
            },
        }
    }));
    api.setState('processConfigurationsLoading', false);
    api.setState('recordsCount', response._rowCount);
    api.setState('processConfigurationsList', { rows });
    api.setState('listRefreshRequested', {
        timestamp: Date.now(),
        background: false,
    });
}
