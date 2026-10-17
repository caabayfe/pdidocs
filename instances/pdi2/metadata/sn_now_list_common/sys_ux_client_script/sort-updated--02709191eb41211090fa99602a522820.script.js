/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({ api, event, helpers, imports }) {
    const { validateDirtyStatus } = imports['sn_now_list_common.ListControllerUtils']();
    if (validateDirtyStatus(...arguments))
        return;

    const { columnDefinitions } = api.data.sn_record_list_data_broker.out;
    const getColumn = ({ column, columnName }) => column ?? (columnName && columnDefinitions?.columns?.find(({ key }) => key === columnName));
    const column = getColumn(event.payload);
    if (!column)
        return;

    const {
            key: columnName,
            label: columnLabel,
            metadata: { isSorted = false, isDescending = false, isSortable = true },
    } = column;
    if(isSortable === false) return;

    const { isDescending: isDescendingOverride } = event.payload;

    if (isSorted && isDescending === isDescendingOverride)
        return;

    api.data.sn_record_list_data_broker.applySort({
        columnName,
        isDescending: isDescendingOverride
    });
    
    let updatedIsDescending = isSorted ? !isDescending : true;

    // If isDescending is provided in the payload, that overrides the default behavior of inverting the value of isDescending
    if (isDescendingOverride !== undefined) {
        updatedIsDescending = isDescendingOverride;
    }

    var message = updatedIsDescending 
            ? await helpers.translate("{0} column sorted in descending order", columnLabel)
            : await helpers.translate("{0} column sorted in ascending order", columnLabel);
    api.emit("SEISMIC_ARIA_LIVE_REGION_UPDATE_REQUESTED",
        {
            message,
            type: 'polite'
        }
    );

    const tableName = api.data.sn_record_list_data_broker.out.table;
    api.data.save_user_preference.execute({
        name: `${tableName}.db.order`,
        value: columnName
    });
    api.data.save_user_preference.execute({
        name: `${tableName}.db.order.direction`,
        value: `${updatedIsDescending ? 'DESC' : 'ASC'}`
    })
}
