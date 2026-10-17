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
    const {
        idleTimeConfiguration,
        selectedEntity,
        processId,
        idleTimeConfiguration: {
            projectActivityDefinitions,
            fields
        }
    } = api.state;
    var activitiesListSelectedRecords = idleTimeConfiguration.projectActivityDefinitions;
 
    const params = {
        value: false,
        entityId: selectedEntity._row_data.uniqueValue,
        processId: processId,
        fields: "",
    };

    const projectActivitiesToRemove = fields.reduce((acc, field) => {
        if (!field.checked) {
            const projectActivity = projectActivityDefinitions.find(pad => pad.field === field.name);
            if (projectActivity) {
                acc.push(projectActivity.sysId);
            }
        }
        return acc;
    }, []);

    api.data.include_idle_time_for_project.execute({
        payload: params
    });

    api.data.delete_activities.execute({
        table: 'promin_activity_def',
        query: 'sys_idIN' + projectActivitiesToRemove.join(','),
    });
}
