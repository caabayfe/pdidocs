/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
            success,
            failed,
            skipped,
            summary
    } = event.payload.data.output;

    var errors = event.payload.data.output.errors;

    if (!errors) {
        errors = [];
    }

    var templateName = api.data.look_up_template.result.name.displayValue;

    var skippedTasksCount = skipped.length;
    var failedTasksCount = failed.length;
    var totalTasksNotAddedCount = skippedTasksCount + failedTasksCount + "";

    if (summary && summary != '') {
        errors.push(summary);
    } else if (skipped || failed) {
        // if there is any skipped or failed tasks, 
        // just include the first error message so the user can fix them one at a time.
        // We don't want to flood their UI with a lot of errors
        if (skippedTasksCount > 0) {
            errors.push(skipped[0].message);
        } else if (failedTasksCount > 0) {
            errors.push(failed[0].message);
        }
    }

    // since this script is called when the add selected broker operation failed,
    // the errors array should contain messages from either the output summary, 
    // skipped/failed messages, or it is a broker level error
    // at least one of the above messages should be given back to the UI
    var error =  errors.join('. ');
    if (totalTasksNotAddedCount > 0) {
        helpers.translate("There was a problem adding {0} tasks to the {1} template because of the following error: {2}", 
            totalTasksNotAddedCount, templateName, error).then((text) => {
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [{
                    "id": "failed_to_add_tasks",
                    "status": "critical",
                    "icon": "info-circle-outline",
                    "content": text,
                    "action": { "type": "dismiss" }
                }]
            });
        });
    }
}
