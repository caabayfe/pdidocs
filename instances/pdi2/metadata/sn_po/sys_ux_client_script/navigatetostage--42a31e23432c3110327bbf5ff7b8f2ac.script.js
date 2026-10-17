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
    if(api.state.projectData?.ismining == true && event.elementId !== 'advanced_view'  && event.elementId !== 'save_exit'){
        return;
    }
   if (event.elementId == 'edit_scope_analysis' || event.elementId === 'edit_entity_card_button' || (event.elementId == "stepper" && event.payload.value == "scope-your-analysis")) {
        helpers.navigate.to("promin_project", {
            projectId: api.state.projectId,
            stage: 'scope-your-analysis'
        }, null, true);
    } else if (event.elementId == 'save_exit') {
        helpers.navigate.to("process-models", {}, { projectId: api.state.projectId }, true);
    } else if (event.elementId == "edit_objectives" || (event.elementId == "stepper" && event.payload.value == "set-objectives")) {
        helpers.navigate.to("promin_project", {
            projectId: api.state.projectId,
            stage: 'set-objectives'
        }, null, true);
    } else if (event.elementId == 'edit_improvement_opportunities' || event.elementId == 'previous' || (event.elementId == "stepper" && event.payload.value == "find-improvement-opportunities")) {
        // navigate to scope your analysis page for playbook data source project.
        helpers.navigate.to("promin_project", {
            projectId: api.state.projectId,
            stage: api.state.isPlaybookSourceTypeProject ? 'scope-your-analysis': 'find-improvement-opportunities'
        }, null, true);
    } else if (event.elementId == "stepper" && event.payload.value == "overview") {
         return;
    } else if (event.elementId === 'advanced_view') {
        helpers.navigate.to(undefined, undefined, {}, false, false, null, {
            url: `/promin_project.do?sys_id=${api.context.props.projectId}`,
        });
        return;
    } else if (event.elementId === 'get_current_project_entities') {
        // No entities exist in project so send user to set objectives
        // page to create new entity
        helpers.navigate.to("promin_project", {
            projectId: api.state.projectId,
            stage: 'set-objectives'
        }, null, true);
    }
    helpers.timing.setTimeout(() => {
        api.emit('SCREEN_STATUS_CHANGED', {
            status: 'closed'
        });
    }, 200);
}
