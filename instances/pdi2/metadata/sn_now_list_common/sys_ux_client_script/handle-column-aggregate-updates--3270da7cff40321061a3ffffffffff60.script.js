function script({api, event, helpers, imports}) {
    const { name, payload } = event;
    const { table, enableColumnCalculations } = api.data.sn_record_list_data_broker.out;
    if (!enableColumnCalculations) return;
    const { columnLimit } = api.context.props;
    const { selectedListMenuItem } = api.data.sn_record_list_data_broker.out.listMenuModel || {};

    const { getEffectiveView } = imports['sn_now_list_common.ListControllerUtils']();
    let view = getEffectiveView(api);

    const columnsProp = selectedListMenuItem?.columns || api.context.props.columns;
    const { columns } = api.data.sn_record_list_data_broker.out.columnDefinitions || {};
    const isColumnsBased = columnsProp || columnLimit > 0;
    const { getListColumnPreferences } = imports['sn_now_list_common.ListControllerUtils']();
    const helper = getListColumnPreferences(api);
    const relatedListName = api.context.props.relatedListName;
    const parentRecordSysId = api.context.props.parentRecordSysId;
    const parentTable = api.context.props.parentTable;
    const relationshipId = relatedListName?.startsWith('REL:') ? relatedListName : '';

    function updateAggregatesInElementRecords(calculationFields) {
        const queryParams = [
            `sysparm_view=${view || ''}`,
            `sysparm_parent_table=${parentTable || ''}`,
            `sysparm_relationship_id=${relationshipId}`,
            `sysparm_parent_record_sysid=${parentRecordSysId || ''}`
        ].join('&');
        const url = `/api/now/ui/calculations/${table}/update-aggregates?${queryParams}`;

        helpers.snHttp(url, {
            method: 'POST',
            body: {
                sysparm_calculation_fields: calculationFields
            }
        }).then(() => {
            api.emit('LIST_CTRL#REFRESH_REQUESTED');
        }).catch(({ error }) => console.log(error));
    }


    function handleClearAllColumnAggregates() {
        api.data.sn_record_list_data_broker.metricTracked({ metricName: 'CLEAR_LIST_CALCULATIONS', metricPayload: {} });
        if (isColumnsBased) {
            helper.saveColumnAggregatesUserPref('{}');
        } else {
            const calculationFields = columns?.reduce((fields, column) => {
                if (column.metadata?.columnAggregatesInfo?.some(aggregate => aggregate.isSelected)) {
                    fields.push({
                        name: column.key,
                        max: { active: false },
                        min: { active: false },
                        sum: { active: false },
                        avg: { active: false }
                    });
                }
                return fields;
            }, []);
            if (calculationFields.length > 0)
                updateAggregatesInElementRecords(calculationFields);
        }
    }

    function handleUpdateColumnAggregates() {
        const { column, aggregates } = payload;
        const allFalse = Object.values(aggregates).every(value => value === false);
        const metricName = allFalse
            ? 'CLEAR_LIST_COLUMN_CALCULATIONS_IN_CALCULATION_MODAL_TYPE'
            : 'LIST_COLUMN_CALCULATIONS';

        api.data.sn_record_list_data_broker.metricTracked({
            metricName,
            metricPayload: {
                field: column,
                ...aggregates
            }
        });
        if (isColumnsBased) {
            const requiredColumns = columns?.map((column) => column.key)
            const preference = JSON.parse(helper.getColumnAggregatesPreference(requiredColumns) || '{}')

            if (allFalse) {
                delete preference[column];
            } else {
                preference[column] = aggregates;
            }
            helper.saveColumnAggregatesUserPref(JSON.stringify(preference));
        } else {
            const calculationFields = [{
                name: column,
                max: {
                    active: !!aggregates['max']
                },
                min: {
                    active: !!aggregates['min']
                },
                sum: {
                    active: !!aggregates['sum']
                },
                avg: {
                    active: !!aggregates['avg']
                }
            }];
            updateAggregatesInElementRecords(calculationFields);
        }
    }


    switch (name) {
        case 'LIST_CTRL#CLEAR_ALL_COLUMN_AGGREGATES':
            handleClearAllColumnAggregates();
            break;
        case 'LIST_CTRL#UPDATE_COLUMN_AGGREGATES':
            handleUpdateColumnAggregates();
            break;
    }

}
