async function handler({api, event, helpers, imports}) { 
    const {
        transformRowsForDisplay
    } = imports['sn_cmdb_ws.DataCertificationListUtil'](...arguments);
    let {
        certificationFields
    } = api.data.getCertTaskData.output;
    const { attrStatusAndCommentCache: attrStatusAndComment, columnDefinitions } = api.state;
    const {
        paginationProps: {
            totalRecordCount
        },
        rowDefinitions 
    } = api.data.listCtrl;
    const { allRecordsSelected, exceptedRecords, selectedRecords, selectionCount } = event.payload;

    let updatedRowDefinitions = await transformRowsForDisplay(rowDefinitions, columnDefinitions, certificationFields.split(','), attrStatusAndComment, {allRowsSelected: allRecordsSelected, exceptedRowIds: exceptedRecords, selectedRowIds: selectedRecords}, selectionCount, totalRecordCount);
    api.setState('rowDefinitions', updatedRowDefinitions);
}
