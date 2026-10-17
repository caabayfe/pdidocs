/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({ api, event, helpers, imports }) {
    // Script: Set journal fields

    const taskData = api.context.props?.agendaItemRecordData?.record || api.context.props?.currentAgendaItem?.record;
    if (!taskData)
        return;

    const activityStreamData = JSON.parse(JSON.stringify(api.context.props.activityStreamData || api.state.activityStreamData));
    activityStreamData.table = taskData?.sys_class_name?.value || '';
    activityStreamData.sysId = taskData?.sys_id?.value || '';
    activityStreamData.hideActivityStream = JSON.parse(`${activityStreamData.hideActivityStream}`.toLowerCase());

    if (!activityStreamData.table || !activityStreamData.sysId)
        activityStreamData.hideActivityStream = true;

    if (activityStreamData.journalFields) {
      let canWrite = false;
      Object.keys(activityStreamData.journalFields).forEach(field => {
          if (!activityStreamData.journalFields[field].readonly)
              canWrite = true;
      });
      activityStreamData.hideActivityStreamComposer = canWrite ? false : true;
    } else
        activityStreamData.hideActivityStreamComposer = true;

    api.setState('activityStreamData', activityStreamData);
}
