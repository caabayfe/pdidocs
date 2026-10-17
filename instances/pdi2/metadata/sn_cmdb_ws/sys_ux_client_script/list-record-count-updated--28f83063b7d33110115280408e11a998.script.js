async function script({api, event}) {
    const {
        allRecordsSelected,
        selectedRecords, 
        selectionCount,
        exceptedRecords,
        query,
        table
    } = event.payload;

    var recordSelection = {
        "allRecordsSelected": allRecordsSelected,
        "selectedRecords": selectedRecords,
        "selectionCount": selectionCount,
        "exceptedRecords": exceptedRecords,
        "query" : query,
        "table" : table
    };
    api.setState("recordSelection", recordSelection);
}
