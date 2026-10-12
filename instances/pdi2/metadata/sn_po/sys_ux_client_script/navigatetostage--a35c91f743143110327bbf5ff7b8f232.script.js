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
    if (event.elementId == 'next') {
        helpers.navigate.to("promin_project", {
            projectId: api.state.projectId,
            stage: 'overview'
        }, null, true);

    } else if (event.elementId == 'previous' || (event.elementId == "stepper" && event.payload.value == "scope-your-analysis")) {
        helpers.navigate.to("promin_project", {
            projectId: api.state.projectId,
            stage: 'scope-your-analysis'
        }, null, true);
    } else if (event.elementId == 'save_exit') {
        helpers.navigate.to("process-models", {}, { projectId: api.state.projectId }, true);
    } else if (event.elementId == "stepper" && event.payload.value == "set-objectives") {
        helpers.navigate.to("promin_project", {
            projectId: api.state.projectId,
            stage: 'set-objectives'
        }, null, true);
    } else if (event.elementId == "stepper" && event.payload.value == "find-improvement-opportunities") {
        return;
    }else if (event.elementId == "stepper" && event.payload.value == "overview") {
           helpers.navigate.to("promin_project", {
            projectId: api.state.projectId,
            stage: 'overview'
        }, null, true);
    } else if (event.elementId === 'advanced_view') {
        helpers.navigate.to(undefined, undefined, {}, false, false, null, {
            url: `/promin_project.do?sys_id=${api.context.props.projectId}`,
        });
        return;
    } else if (event.elementId === 'get_project_entities') {
        // No entities exist in project so send user back to set objectives
        // page to create new entity
        helpers.navigate.to("promin_project", {
            projectId: api.state.projectId,
            stage: 'set-objectives'
        }, null, true);
    } else if (event.elementId == "dirty_project_alert" && event.name=='NOW_ALERT#TEXT_LINK_CLICKED') {
        helpers.navigate.to("promin_project", {
            projectId: api.context.props.projectId,
            stage: 'overview'
        }, null, true);
    }

    helpers.timing.setTimeout(() => {
        api.emit('SCREEN_STATUS_CHANGED', {
            status: 'closed'
        });
    }, 200);
}
