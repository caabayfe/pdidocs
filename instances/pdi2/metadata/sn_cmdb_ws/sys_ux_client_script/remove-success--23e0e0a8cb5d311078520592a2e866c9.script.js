/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    api.setState("exclListRefresh", {timestamp: new Date()});
    var totalRecordsDeleted = 0;
    if(api.data.dmExcludedCIsController.rowSelection.allRecordsSelected) {
        totalRecordsDeleted = api.data.dmExcludedCIsController.rowSelection.selectionCount;
    } else {
        totalRecordsDeleted = api.state.selectedExcludedCIs.split(",").length;
    }

    api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
        items: [
            {
                id: 'success1',
                    "status": "positive",
                    "icon": "check-circle-outline",
                    content:  totalRecordsDeleted + await helpers.translate(' records removed from exclusion list'),
                    action: { type: 'dismiss' }
            }
        ]
    });

    const timeoutId = helpers.timing.setTimeout(() => {
        api.emit('NOW_UXF_PAGE#REMOVE_NOTIFICATIONS', {
        items: [{id: 'success1'}]
    }); }, 5000);
}
