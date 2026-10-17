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
    var obj = {};
    obj['state'] = 'COMPLETE';
    obj['assigned_to']=api.context.session.user.sys_id;
    api.data.update_record.execute({
         table: 'sys_flow_data',
         sys_id: api.context.props.experienceProperties.flow_record.value,
         data: JSON.stringify(obj)
     });
     api.data.sow_remediate_execute_action.execute({
         execId: api.context.props.parentRecord
     });

}
