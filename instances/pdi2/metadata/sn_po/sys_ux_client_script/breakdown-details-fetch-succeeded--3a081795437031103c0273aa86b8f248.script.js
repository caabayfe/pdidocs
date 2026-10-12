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
    const breakdownDetails = api.data.look_up_breakdown_details.result;

    const {
        selectedEntity
    } = api.state;
    let currentView = { ...api.state.currentView
    };
    currentView = {
        view: api.state.VIEWS.BREAKDOWN_FORM,
        params: {
            mode: 'EDIT',
        },
    };
    api.setState('currentView', currentView);
    const tableName = selectedEntity.table.value;
    api.data.get_breakdown_fields.execute({
        tableName: tableName,
        currentTableName: 'promin_breakdown_field',
        entityId: selectedEntity._row_data.uniqueValue,
    });

    const fetchedBreakdownForm = {
        fields: {
            displayName: {
                disabled: false,
                invalid: false,
                value: breakdownDetails.display_name.value,
            },
            field: {
                selectedValue: [],
                value: breakdownDetails.field.value,
                details: {
                    label: breakdownDetails.field.displayValue,
                    referenceTable: breakdownDetails.filter_table.value,
                },
            },
            filter: {
                value: breakdownDetails.filter.value,
                partial: false,
            },
            hasFilter: {
                value: breakdownDetails.has_filter.value,
            },
        },
    };
    api.setState('filterCondition', breakdownDetails.filter.value);

    api.setState('listSelectorCurrentTable', tableName);
    api.setState('listSelectorSelectedItems', []);
    api.setState('breakdownForm', fetchedBreakdownForm);

    api.data.get_breakdown_field_source_table.execute({
        rootTable: api.state.selectedEntity.table.value,
        field: fetchedBreakdownForm.fields.field.value,
    });
}
