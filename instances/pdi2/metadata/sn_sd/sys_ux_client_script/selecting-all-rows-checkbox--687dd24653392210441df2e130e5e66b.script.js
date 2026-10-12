/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const rowsData = api.state.rowsData;
    if (!rowsData || !rowsData.rows) {
        return;
    }

    const isChecked = event.payload.isChecked;
    const updatedRows = rowsData.rows.map(row => ({
        key: row.key,
        metadata: row.metadata,
        cells: row.cells,
        selectionDisabled: row.selectionDisabled,
        isSelected: !!isChecked,

    }));

    var selectedKeyArray = [];
    for (var i = 0; i < updatedRows.length; i++) {
        if (!updatedRows[i].selectionDisabled)
            selectedKeyArray.push(updatedRows[i].key);
    }

    api.setState('selectedRowsCount', selectedKeyArray.length);
    api.setState('selectedRows', selectedKeyArray);
    api.setState('rowsData', {
        rows: updatedRows
    });

    // If there are inherited roles, display the message
    if (isChecked && updatedRows.length != selectedKeyArray.length) {
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: [{
                id: "playbookAlert",
                status: "info",
                icon: "circle-info-outline",
                content: await helpers.translate("Users who have inherited the role from another role are not selected."),
                action: {
                    type: "dismiss"
                },
            }]
        });
        helpers.timing.setTimeout(() => api.emit("NOW_UXF_PAGE#REMOVE_NOTIFICATIONS", {
            items: [{
                id: "playbookAlert"
            }]
        }), 5000);
    }
}
