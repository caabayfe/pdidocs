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
    if (event.elementId == 'open_dedupe_tasks_button' || event.payload.action.action_button_name == 'view_tasks_button') {
        helpers.navigate.to('de-duplication-tasks', {
            'stateFiltered': "default"
        });
    } else if (event.payload.action.action_button_name == 'create_template_button') {
        helpers.navigate.to('de-duplication-template-library');
    }

}
