function script({api, event}) {  
    const {
        allRecordsSelected,
        selectedRecords, 
        selectionCount,
        exceptedRecords,
        query,
        table
    } = event.payload;

    var rowSelection = {
       "allRecordsSelected" : allRecordsSelected,
        "selectedRecords": selectedRecords,
        "selectionCount": selectionCount,
        "exceptedRecords" : exceptedRecords,
         "query" : query,
        "table" : table
    };

    api.setState("rowSelection", rowSelection);
}
