function handler({ api, event, helpers, imports }) {

    // This script filters rows with "Audit Enabled" items and stores the list in the 'selectedItem' state as a formatted JSON string.

    const tableRows = api.data.list_controller_4.rowDefinitions.rows;
    const enabledElement = [];

    const infiniteScrollFilteredRows = tableRows.filter(row => row.key !== 'infiniteScrollEndOfListRow');

    infiniteScrollFilteredRows.forEach(row => {
        const auditStatus = row.cells.AuditS; 
        const element = row.cells.element; 
        const columnLabel = row.cells.column_label;

        if (auditStatus && auditStatus.value === "Enabled") {

            if ((element && !element.value) && (columnLabel && !columnLabel.value)) {
                return; 
            }

            const item = {};

            if (element && element.value) {
                item.id = element.value; 
            }

            if (columnLabel && columnLabel.value) {
                item.label = columnLabel.value; 
            }

            let filterElement = enabledElement.find(sub => sub[0] && sub[0].id === item.id);

            if (!filterElement) {
                filterElement = [];
                enabledElement.push(filterElement);
            }

            filterElement.push(item);
        }
    });

    const finalEnabledElement = JSON.stringify(enabledElement, null, 4);

    api.setState('selectedItem', finalEnabledElement);

}
