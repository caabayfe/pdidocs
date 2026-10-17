function script({api, event, imports}) {
    const { getListColumnPreferences } = imports['sn_now_list_common.ListControllerUtils']();
    const helper = getListColumnPreferences(api);
    const {
        value,
        name,
        isColumnWidths,
        isColumnOrder,
        isColumnAggregates,
        columnPreferences,
        isColumnPinning,
    } = helper.transform(event.payload);

    if (isColumnWidths)
        helper.updatePreference(name, value);
    else if (isColumnOrder) {
        const { columns: oldColumns } = api.data.sn_record_list_data_broker.out.columnDefinitions;
        const preferences = helper.getColumnOrderDependentPreferences(value);
        if (value !== oldColumns.map(({key}) => key).join(',')) {
            preferences.length > 0
            ? api.setState('shouldRefreshList', true)
            : api.emit('LIST_CTRL#REFRESH_REQUESTED');
        }
        else if (name)
            helper.updatePreference(name, value);
        if (preferences.length > 0)
            helper.saveColumnPreferences(preferences);
    } else if (isColumnAggregates) {
        api.emit('LIST_CTRL#REFRESH_REQUESTED');
    } else if (columnPreferences) {
        const columnAggregatesPref = columnPreferences?.find(pref => !!pref.name?.match(/list\.columnAggregates\./g));
        if (api.state.shouldRefreshList) {
            api.setState('shouldRefreshList', false);
            api.emit('LIST_CTRL#REFRESH_REQUESTED');
        } else {
            helper.updatePreferences(columnPreferences);
        }
    } else if (isColumnPinning) {
        helper.updatePreference(name, value);
        api.data.sn_record_list_data_broker.updateHeaderColumnPinActions({
            columnPinningInfo: JSON.parse(value),
        });
    }
}
