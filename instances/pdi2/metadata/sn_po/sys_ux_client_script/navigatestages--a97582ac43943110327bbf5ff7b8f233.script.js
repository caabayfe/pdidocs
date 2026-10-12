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
    if(event?.payload?.value == "set-objectives"){
        return;
    }
    if (api.state.exit == true) {
        helpers.navigate.to("process-models", {}, { projectId: api.context.props.projectId }, true);
    } else if (event.elementId == "create_project_from_template_1" || event?.payload?.value=='overview') {
        helpers.navigate.to("promin_project", {
            projectId: api.state.isEditing ? api.context.props.projectId : event.payload?.data?.output?.data?.GlidePromin_Mutation?.createProjectDefinitionFromTemplate?.projectId,
            stage: 'overview'
        }, null, true);
    } else if(event.elementId == "create_entity_record" 
        || event?.payload?.value=="scope-your-analysis" 
        || event.elementId == "edit_promin_project" 
        || event.elementId === 'create_primary_entity'
        || event.elementId == "create_new_playbook_project") {
        helpers.navigate.to("promin_project", {
            projectId: api.state.projectId,
            stage: 'scope-your-analysis'
        }, null, true);
    }else if(event?.payload?.value == "find-improvement-opportunities"){
        helpers.navigate.to("promin_project", {
            projectId: api.context.props.projectId,
            stage: 'find-improvement-opportunities'
        }, null, true);
    } else if (event.elementId === 'advanced_view') {
        helpers.navigate.to(undefined, undefined, {}, false, false, null, {
            url: `/promin_project.do?sys_id=${api.context.props.projectId}`,
        });
        return;
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
