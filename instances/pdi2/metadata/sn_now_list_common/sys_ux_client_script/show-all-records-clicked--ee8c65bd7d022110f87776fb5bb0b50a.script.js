function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        payload: {
            context: {
                row: {
                    nowListGroupedRowMetaData: {
                        groupByField: columnName,
                        groupQuery
                    }
                }
            }
        }
    } = event;
    if (columnName)
        api.data.sn_record_list_data_broker.applyGroupbyShowAll({
            groupQuery
        });
}
