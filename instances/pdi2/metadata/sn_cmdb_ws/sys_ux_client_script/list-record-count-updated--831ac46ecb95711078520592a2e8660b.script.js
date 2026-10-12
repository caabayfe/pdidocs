async function script({api, event, helpers, imports}) {
    const {
        allRecordsSelected,
        selectedRecords, 
        selectionCount,
        query,
        table
    } = event.payload;
    const { FORM_ICONS, resetCurrentTab } = imports["sn_cmdb_ws.DataManagerStateUtil"]();
    const { selectedTabId, formViewStateMap } = api.state;
    
    api.setState("continueBtnDisabled",!(selectionCount > 0));
    if(selectionCount === 0) {
         //change the current view's form icon status to editing, and next view's form icon status to locked
         resetCurrentTab(selectedTabId, formViewStateMap);
    }

    var recordSelection = {
        "allRecordsSelected": allRecordsSelected,
        "selectedRecords": selectedRecords,
        "selectionCount": selectionCount,
         "query" : query,
        "table" : table
    };
    api.setState("recordSelection", recordSelection);
    var reviewListFixedFilter = "";
    if (recordSelection.allRecordsSelected) {
        if (recordSelection.query) {
            // covers exceptedRecords case
            reviewListFixedFilter = api.state.dataFilter?.encoded_query ? api.state.dataFilter.encoded_query + '^' + recordSelection.query : recordSelection.query;
        } else {
            reviewListFixedFilter = api.state.dataFilter?.encoded_query;
        }
    } else {
        reviewListFixedFilter = recordSelection.query;
    }
    api.setState("reviewListFixedFilter", reviewListFixedFilter);

    const RECORDS = await helpers.translate("Records");
    const recordScoreJson = [
        {
            "data": [
                {
                    "value": selectionCount + "" || "0"
                }
            ],
            "metadata": {
                "dataSourceLabel": RECORDS.charAt(0).toUpperCase() + RECORDS.slice(1)
            }
        }
    ];
    api.setState("recordsScorecardData", recordScoreJson);
}
