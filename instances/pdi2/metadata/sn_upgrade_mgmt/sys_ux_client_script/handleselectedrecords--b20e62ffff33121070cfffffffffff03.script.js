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
    try {
        const oldTempSelectedRows = JSON.parse(JSON.stringify(api.state.tempSelectedRows));
        const selectedRows = event.payload.selectedRows;
        const checked = event.payload.checked;
        let value = checked ? (selectedRows ? Object.keys(selectedRows) : []) : event.payload.value;
        if (!Array.isArray(value)) value = [value];

        for (let i = 0; i < value?.length; i++) {
            if (checked) {
                oldTempSelectedRows[value[i]] = selectedRows[value[i]];
            } else {
                delete oldTempSelectedRows[value[i]];
            }
        }

        api.setState('selectedSkippedRecords', Object.keys(oldTempSelectedRows));

        const newSkippedRows = { ...api.state.skippedRows };
        newSkippedRows?.rows.forEach((row) => {
            row.isSelected = false;
            if (selectedRows[row.key]) {
                row.isSelected = true;
            }
        });
        let tempFileNames = [];
        let tempRecordOwners = [];

        Object.entries(oldTempSelectedRows).forEach(el => {
            const [key, value] = el;
            tempFileNames.push(value?.cells?.name?.value);
            tempRecordOwners.push(value?.cells?.owner?.value);
        });
        api.setState('selectedRecordsNames', tempFileNames);
        api.setState('selectedRecordsOwners', tempRecordOwners);
        api.setState('tempSelectedRows', oldTempSelectedRows);
        api.setState('skippedRows', newSkippedRows);
    } catch (error) {
        console.log("Error in handleSelectedRecords client script", error);
    }
}
