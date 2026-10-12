/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({
    api,
    event,
    helpers,
    imports
}) {
    var selectedRows = event.payload.selectedRows;
    // api.setState("rowSelections", {...selectedRows});
 
    const newOrigData = {...api.state.origRowData};
    const tempMap = {};
    const startIndex = (api.state.page) * api.state.offset;
    const visibleRows = api.state.rowData.rows?.slice(startIndex, startIndex + api.state.offset);
    const visibleKeys = {};
    visibleRows.forEach(row => {
        visibleKeys[row.key] = true;
    })
    //Only change state of visible rows as selectedRows only gives state of rows for visible rows;
 
    newOrigData.rows.forEach(row => {
        if(visibleKeys.hasOwnProperty(row.key)) {
            if(selectedRows[row.key]){
                row.isSelected = true;
                tempMap[row.key] = true;
            }else{
                row.isSelected = false;
                tempMap[row.key] = false;
            }
        }
        
    });
    const newRowData = {...api.state.rowData};
 
    newRowData.rows.forEach((row,idx) => {
        if(tempMap.hasOwnProperty(row.key)){
            row.isSelected = tempMap[row.key];
        }
            
    });
    // console.log("newRowData", newRowData);
    // console.log("newOrigData", newOrigData);
    api.setState('origRowData', newOrigData);
    api.setState('rowData', newRowData);
}
