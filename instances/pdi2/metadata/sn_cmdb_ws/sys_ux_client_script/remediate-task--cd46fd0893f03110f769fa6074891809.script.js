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

    switch(api.state.selectedRemediateOption) {
    case "remediate_using_template":
        var taskSysId = api.context.props.sysId;
        api.data.deduplication_template_remediate_task.execute({
            "templateSysId": api.state.templateValueSet,
            "taskId": taskSysId
        });
       helpers.modal.close('remediate_task_modal');
        break;
    case "remediate_manually":
    case "remediate_manually_restricted":
        //remediate manually option is selected, redirect to the old workflow
        var taskNumber = api.data.record.form.fields.number.value;
        var taskSysId = api.context.props.sysId;
        helpers.navigate.to(
            null,
            null,
            null,
            false,
            false,
            null, {
                url: '/$duplicateResolver.do?sysparm_task_id=' + taskSysId + '&sysparm_task_label=' + taskNumber + '&sysparm_restricted_mode=' + (api.state.selectedRemediateOption == 'remediate_manually_restricted'),
                target: '_self'
            },
        );
        break;
    }
}
