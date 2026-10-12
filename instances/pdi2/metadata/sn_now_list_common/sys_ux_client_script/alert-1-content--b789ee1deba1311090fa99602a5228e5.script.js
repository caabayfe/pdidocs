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

    const message = helpers.translateSync('You can only edit the {0} record(s) selected on this page', sysIds.length);

    return message;
}
