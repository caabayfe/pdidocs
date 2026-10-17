function script({api, event, helpers, imports}) {
   if (!event.payload)
        return;

     const { dataFilter, recordSelection, selectedTabId, formViewStateMap } = api.state;     
     const { value, name } = event.payload;  
     const { FORM_ICONS, resetCurrentTab } = imports["sn_cmdb_ws.DataManagerStateUtil"]();

     if (name === 'data_filter:table') {
      // blank out the encoded query, hide the list if the data filter table changes
       dataFilter.encoded_query = "";
       dataFilter.table = value;
       dataFilter.tableLabel = event.payload.item.label;
       api.setState("hideDataFilterList", true);
       api.setState("dataFilterListRefresh", {timestamp: new Date()});

        recordSelection.allRecordsSelected = false;
        recordSelection.selectedRecords = null;
        recordSelection.selectionCount = 0;
        recordSelection.query = null;
        recordSelection.table = null;       
         api.setState("continueBtnDisabled", true);

        //change the current view's form icon status to editing, and next view's form icon status to locked
         resetCurrentTab(selectedTabId, formViewStateMap);
    }

   api.setState("dataFilter", dataFilter);
   api.setState("recordSelection",  recordSelection);
    
}
