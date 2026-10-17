function script({ api, event }) {
  const { action, table, query, selectProps } = event.payload;
  const selectedRecs = selectProps.selectedRowIds;
  let selectedRecordsQuery = "";
  let selectedRowsCount;

  if (selectProps.allRowsSelected) {
    const exceptedRecords = selectProps.exceptedRowIds;
    selectedRowsCount =
      action === "exclude"
        ? api.state.dataFilterTabArray[0].count
        : api.state.dataFilterTabArray[1].count;
    selectedRecordsQuery = "sys_idNOT IN";

    if (exceptedRecords.length > 0) {
      selectedRecordsQuery += exceptedRecords.join(",") + ",";
      selectedRowsCount -= exceptedRecords.length;
    }
  } else {
    const selectedRecords = selectProps.selectedRowIds;
    selectedRowsCount = selectedRecs.length;
    selectedRecordsQuery = "sys_idIN";

    if (selectedRecords.length > 0) {
      selectedRecordsQuery += selectedRecords.join(",") + ",";
    }
  }

  const rowSelection = {
    allRecordsSelected: selectProps.allRowsSelected,
    selectedRecords: selectProps.selectedRowIds,
    selectionCount: selectedRowsCount,
    exceptedRecords: selectProps.exceptedRowIds,
    query: selectedRecordsQuery,
    table: table,
  };

  const { cmdb_policy_type } = api.state.policyData.general_info;
  const { dataFilterTabArray } = api.state;
  const oldFirstTab = dataFilterTabArray[0];
  const oldSecondTab = dataFilterTabArray[1];
  let updatedTabList = [];

  if (table !== "cmdb_policy_ci_exclusion_list") {
    const updatedFirstTab = {
      ...oldFirstTab,
      disableButton: selectedRowsCount > 0 ? false : true,
    };
    updatedTabList = [updatedFirstTab, oldSecondTab];
    api.setState("excludeRowSelection", rowSelection);
  } else {
    const updatedSecondTab = {
      ...oldSecondTab,
      disableButton: selectedRowsCount > 0 ? false : true,
    };
    updatedTabList = [oldFirstTab, updatedSecondTab];
    api.setState("includeRowSelection", rowSelection);
  }

  api.setState("dataFilterTabArray", updatedTabList);

  if (action === "exclude") {
    const policyType = [{ itemId: cmdb_policy_type }];
    api.data.data_manager_save_exclusion_list.execute({
      payload: {
        policyTypesList: policyType,
        recordSelection: rowSelection,
        dataFilter: api.state.policyData.data_filter,
      },
    });
  } else if (action === "include") {
    api.data.remove_records_from_exclusion_list.execute({
      sysIds: rowSelection.selectedRecords,
      rowSelection: rowSelection,
    });
  }
}
