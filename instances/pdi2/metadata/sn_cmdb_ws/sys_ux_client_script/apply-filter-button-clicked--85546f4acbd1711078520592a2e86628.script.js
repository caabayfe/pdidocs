async function script({ api, event, helpers, imports }) {
    const filtersText = await helpers.translate("Filters");
    const tableText = await helpers.translate("Table");
    api.setState("hideDataFilterList", false);
    api.data.getSearchResultCount.refresh();

    const table = api.state.dataFilter.table;
    const tableLabel = api.state.dataFilter.tableLabel;
    const encoded_query = api.state.dataFilter.encoded_query;

    //reset recordsSelection state
    var recordSelection = {
        "allRecordsSelected": false,
        "selectedRecords": null,
        "selectionCount": 0,
         "query" : null,
        "table" : null
    };
    api.setState("recordSelection",  recordSelection);
    api.setState("continueBtnDisabled", true);

    // trigger fetch of the display value for enforced condition. This needs to be fetched separately as its not allowed in scope.
    helpers.snHttp('/api/now/cmdb_workspace_api/encodedquery?table=' + table + '&query=' + encoded_query,
        {
            method: 'GET',
            batch: false
        }
    ).then(function ({ response }) {
        if (response.result && response.result.errors.length === 0) {
            const encodedQueryLabel = response.result.encodedQueryDisplayValue;

            api.setState("encodedQueryDisplayValue", {
                "label": tableText + " = " + tableLabel +
                    (encodedQueryLabel ? " > " + filtersText + " = " + encodedQueryLabel + " " : "")
            });
        }
    });

}
