/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    try {
        // const results = api.data.look_up_multiple_records_2.results;
        const results = api.data.upgrade_management___get_skipped_records_1.output;
        if (!results || !results.length) return {};

        const temp = {};
        const oldSelectedSkippedRecords = [...api.state.selectedSkippedRecords];
        for (let i = 0; i < oldSelectedSkippedRecords.length; i++) {
            temp[oldSelectedSkippedRecords[i]] = true;
        }

        const rows = [];

        // Priority configurations
        const PRIORITY_CONFIG = {
            '1': { color: 'critical', label: '1 - Critical' },
            '2': { color: 'high', label: '2 - High' },
            '3': { color: 'moderate', label: '3 - Moderate' },
            '4': { color: 'low', label: '4 - Low' },
            '5': { color: 'teal', label: '5 - Planning' },
            default: { color: 'gray', label: 'N/A' }
        };

        for (let i = 0; i < results.length; i++) {
            var priority = PRIORITY_CONFIG[results[i]['a_type_priority']?.value] || PRIORITY_CONFIG.default;
            // using sys_id of skipped records as key to use later to assign owner
            // disable selection for assigning users of records which don't have associated upgrade history task 
            var currentRow = {
                key: results[i]['a_sys_id'].value,
                type: 'default',
                selectionDisabled: !results[i]['b_sys_id'].value,
                cells: {
                    name: {
                        value: results[i]['a_file_name'].displayValue,
                        label: results[i]['a_file_name'].displayValue,
                        sys_id: results[i]['a_sys_id'].value
                    },
                    product: {
                        value: results[i]['a_application_category'].displayValue
                    },
                    priority: {
                        componentProps: {
                            label: priority.label,
                            color: priority.color
                        },
                        value: results[i]['a_type_priority'].displayValue
                    },
                    status: {
                        value: results[i]['a_resolution_status'].displayValue
                    },
                    test: {
                        value: results?.[i]?.['test_count'] > 0 ? 'Test linked' : '',
                        label: results?.[i]?.['test_count'] > 0 ? 'Test linked' : '',
                        sys_id: results[i]['a_sys_id'].value,
                        file_name: results[i]['a_file_name'].displayValue
                    },
                    disposition: {
                        value: results[i]['a_disposition'].displayValue
                    },
                    owner: {
                        value: results[i]['b_assigned_to'].displayValue
                    },
                    plugin: {
                        value: results?.[i]?.['a_plugin']?.displayValue || ""
                    },
                },
                isSelected: temp[results[i]['a_sys_id'].value] ? true : false // Added
            };

            // remove test linked column in case of production
            if (api.context.props.experienceProperties?.environment?.value?.toLowerCase?.() === 'production') {
                delete currentRow.cells.test;
            }
            rows.push(currentRow);
        }

        api.setState('skippedRows', { rows: rows });
    } catch (error) {
        console.log("Error in executing Fetch skipped records client script", error);
    }
}
