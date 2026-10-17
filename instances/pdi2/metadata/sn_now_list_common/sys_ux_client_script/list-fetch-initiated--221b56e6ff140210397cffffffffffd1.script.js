function script({
    api
}) {
    const {
        columns,
        rowLimit,
        listTitle,
        columnLimit,
        currentPage,
        view,
        query,
        table,
        requestMetadata: {
            requestId,
            hideLoader,
            appendRows
        },
        aiGroupInfo,
    } = api.state
    api.data.sn_record_list_data_broker.dataFetchInitiated({
        hideLoader,
        appendRows,
        aiRequestType : aiGroupInfo?.requestedType
    });
    api.emit('LIST_CTRL#DATA_FETCH_INITIATED', {
        columns,
        limit: rowLimit,
        listTitle,
        maxColumns: columnLimit,
        query,
        table,
        requestId,
        page: currentPage,
        timestamp: Date.now(),
        view
    });
}
