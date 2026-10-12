/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const {
        selectionProps: {
            selectedRowIds,
            allRowsSelected,
            exceptedRowIds
        },
        rowDefinitions: {
            rows
        },
    } = api.data.controller;

    let sysIds;
    if (allRowsSelected) {
        const allSysIds = rows.map((row) => row.key);
        const selectedRecordsOnPage = allSysIds.filter(
            (sysId) => !exceptedRowIds.includes(sysId)
        );
        sysIds = selectedRecordsOnPage;
    } else {
        sysIds = selectedRowIds;
    }
   const updatedSysIds = sysIds.map(sysId => {
      const keyArray = sysId.split('@');
	  return keyArray[keyArray.length-1];
   })
    return updatedSysIds.join(',');
}
