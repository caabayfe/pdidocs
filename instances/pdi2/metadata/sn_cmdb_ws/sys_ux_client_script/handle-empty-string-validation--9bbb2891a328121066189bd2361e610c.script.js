/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    let {
        certifiedRecords,
        emptyRecords
    } = event.payload;

    var ALL_EMPTY = await helpers.translate("The selected records include fields without values. This task’s policy doesn’t allow certification of records with empty fields. Populate the empty fields or mark as failed.");
    var SOME_EMPTY = await helpers.translate("{0} of the selected records were certified. {1} of the records weren’t certified as this task’s policy doesn’t allow certification of records with empty fields. Populate the empty fields or mark as failed.", certifiedRecords.length, emptyRecords.length);

    if (emptyRecords.length > 0 && certifiedRecords.length === 0) {
        // All the selected records have empty fields
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                "id": "empty_values",
                "status": "critical",
                "icon": "info-circle-outline",
                "content": ALL_EMPTY,
                "action": { "type": "dismiss" }
            }]
        });
    }
    else if (emptyRecords.length > 0 && certifiedRecords.length > 0) {
        // Some of the records have empty fields
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                "id": "empty_values",
                "status": "critical",
                "icon": "info-circle-outline",
                "content": SOME_EMPTY,
                "action": { "type": "dismiss" }
            }]
        });
    }
}
