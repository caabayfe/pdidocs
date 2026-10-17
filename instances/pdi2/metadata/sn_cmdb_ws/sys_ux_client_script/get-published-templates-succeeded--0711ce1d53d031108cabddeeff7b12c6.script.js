/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('readyTemplatesLoading', false);
    var result = api.data.get_list_of_published_dedup_templates.output;
    var templatesWithTasks = result.template_details.filter(t1 => t1.template_tasks_count != 0);
    api.setState('readyTemplatesCount', templatesWithTasks.length);
    api.setState('templateTasksCount', result.total_tasks);
    var templateSysIds =  templatesWithTasks.map(t => t.template_sys_id);
    api.setState('runnableTemplatesSysIds', templateSysIds);
    api.setState('lastUpdatedInfo', result.lastUpdatedInfoText);
}
