/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {

    const getColumnIds = (cols) => cols.map(col => col['id']).join('.');
    const flattenColumns = (cols) => cols.map(getColumnIds);
    const maxColumnsLimitReachedAlert = {
        id: "max_displayed_cols_limit_msg",
        status: "critical",
        icon: "circle-close-outline",
        content: '',
        action: {
            type: "dismiss"
        },
    };

    // get a flattened version of old selected columns from state
    let oldCols = api.state.editColumnsState?.oldCols;
    if(!oldCols) {
        // if not in state yet, calc old columns (flattened, stringified version for easy value check against new columns) 
        oldCols = flattenColumns(api.data.controller.editColumnsProps.selectedColumns).join(' ');
    }
    const maxColumnsLimitReached = api.data.controller.columnLimit > 0 && event.payload.length > api.data.controller.columnLimit
    const selectedColumns = maxColumnsLimitReached ? api.state.editColumnsState?.selectedColumns || api.data.controller.editColumnsProps.selectedColumns : event.payload;
    // format the new selected columns to pass back to list controller on apply
    const selectedColumnsIds = flattenColumns(selectedColumns);

    // check if the changes are new, we use this for enabled/disable the apply button
    const haveChangesToApply = Boolean(selectedColumnsIds.length && (selectedColumnsIds.join(' ') !== oldCols));

    api.setState("editColumnsState", {
        oldCols,
        selectedColumns,
        selectedColumnsIds,
        haveChangesToApply
    });

    if(maxColumnsLimitReached){
        maxColumnsLimitReachedAlert.content = await helpers.translate(`This list has been configured to display a maximum of {0} columns. You cannot add any additional columns.`, api.data.controller.columnLimit);
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: [maxColumnsLimitReachedAlert]
        });
    }
}
