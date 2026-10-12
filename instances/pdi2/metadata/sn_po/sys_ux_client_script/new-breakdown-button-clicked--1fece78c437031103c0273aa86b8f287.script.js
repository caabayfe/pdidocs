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
    const { selectedEntity } = api.state;
    let currentView = { ...api.state.currentView
    };
    currentView = {
        view: api.state.VIEWS.BREAKDOWN_FORM,
        params: {
            mode: 'NEW',
        },
    };
    api.setState('currentView', currentView);
    const tableName = selectedEntity.table.value;
    api.data.get_breakdown_fields.execute({
        tableName: tableName,
        currentTableName: 'promin_breakdown_field',
        entityId: selectedEntity._row_data.uniqueValue,
    });
    api.setState('listSelectorCurrentTable', tableName);
    api.setState('listSelectorSelectedItems', []);
    api.setState('breakdownForm', {
        fields: {
            displayName: {
                disabled: false,
                invalid: false,
                value: '',
            },
            field: {
                selectedValue: [],
                value: '',
                details: {},
            },
            filter: {
                value: '',
                partial: false,
            },
            hasFilter: {
                value: false,
            },
        },
    });
    api.setState('filterCondition','');
}
