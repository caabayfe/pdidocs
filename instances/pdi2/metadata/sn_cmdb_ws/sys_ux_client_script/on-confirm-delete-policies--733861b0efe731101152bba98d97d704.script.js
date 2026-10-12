function script({api, event, imports}) { 
   const { cloneDeep } = imports['sn_cmdb_ws.CmdbWsCloneUtil']();
   const {
        recordSelection
    } = api.state;
     
   const {
        allRecordsSelected,
        selectedRecords, 
        selectionCount,
        query,
        table
    } = recordSelection;

   if (recordSelection.allRecordsSelected) {
      const subSelectedTabIndex = api.context.props.subSelectedTabIndex;
      const policiesTabs = api.data.getPoliciesTabs?.output;

      const fixedFilter = policiesTabs[subSelectedTabIndex]?.fields?.fixedFilter;

      recordSelection.allRecordsSelected = allRecordsSelected;
      recordSelection.selectedRecords = selectedRecords;
      recordSelection.selectionCount = selectionCount;
      recordSelection.query = query;
      recordSelection.table = table;
      recordSelection.fixedFilter = fixedFilter;

       api.setState("recordSelection", cloneDeep(recordSelection));
   }

    api.data.data_manager_delete_policies.execute({
      recordSelection: api.state.recordSelection
    });
}
