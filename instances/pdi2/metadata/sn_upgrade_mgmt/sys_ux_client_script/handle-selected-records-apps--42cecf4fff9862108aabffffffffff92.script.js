/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event
}) {
    const { checked, selectedRows, value } = event.payload;
    const rowData = api.state.rowData;
    const total = rowData.rows.length;
    const page = api.state.page || 0;
    const offset = api.state.offset || 0;
    const start = page * offset;
    const end = Math.min(start + offset - 1, total - 1);
    const isMultiSelect = Array.isArray(value);

    const _selectedRows = { ...(api.state.selectedRows || {}) };
    let atleastOneScheduleExists = false;

    const toggleRow = (row) => {
        if (row.selectionDisabled) return;

        row.isSelected = checked;
        if (checked) {
            _selectedRows[row.key] = row;
        } else {
            delete _selectedRows[row.key];
        }
    };

    for (let i = start; i <= end; i++) {
        const row = rowData.rows[i];
        if (isMultiSelect) {
            toggleRow(row);
        } else if (row.key === value) {
            toggleRow(row);
            break;
        }
    }

    const keys = Object.keys(_selectedRows);
    const hasSelectedRow = keys.length > 0;

    // Check if any selected row has a schedule.
    atleastOneScheduleExists = keys.some(key => {
        const sched = _selectedRows[key]?.cells?.schedule;
        return sched && sched.schedule_id;
    });

    api.setState('rowData', rowData);
    api.setState('selectedRows', _selectedRows);
    api.setState('shouldDisableUpdateBtn', !hasSelectedRow);
    api.setState('shouldDisableScheduleBtn', !hasSelectedRow);
    api.setState('shouldDisableDeleteScheduled', !atleastOneScheduleExists);
}
