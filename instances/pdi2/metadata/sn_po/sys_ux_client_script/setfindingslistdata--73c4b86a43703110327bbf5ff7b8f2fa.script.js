/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const label = await helpers.translate('Impacted KPI(s)');
    const columnDefinition = event.payload.columnDefinitions.columns.map((data) => {
        if (data.key == "impacted_kpis") {
            return { ...data,
                'label': label
            };
        }
        return data;
    });

    if (event.elementId == 'list_controller') {
        api.setState('columnDefinition', {
            "columns": columnDefinition
        });
        const newData = event.payload.rowDefinitions.rows.map((data) => {
            return { ...data,
                'isSelected': false
            };
        });
        api.setState('findingListData', {
            "rows": newData
        });
        api.setState('ruleBasedFindingsCount', newData.length);
    } else {
        api.setState('columnDefinitionAutomated', {
            "columns": columnDefinition
        });
        const newData = event.payload.rowDefinitions.rows.map((data) => {
            return { ...data,
                'isSelected': false
            };
        });
        api.setState('findingListAutomatedData', {
            "rows": newData
        });
        api.setState('automatedFindingsCount', newData.length);
    }
}
