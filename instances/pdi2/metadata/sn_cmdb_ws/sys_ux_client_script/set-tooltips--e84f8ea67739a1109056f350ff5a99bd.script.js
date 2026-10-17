/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {

  if(api.data.ms_allow_query_edit.output) {
    const editButtonToolTip = await helpers.translate('Edit query');
        api.setState('editButtonToolTip', editButtonToolTip);
    const createScheduleButtonToolTip = await helpers.translate('Create a schedule if you want to run this report on a recurring basis (required for creating linked Performance Analytics reports)');
        api.setState('createScheduleButtonToolTip', createScheduleButtonToolTip);
  } else {
    const editButtonToolTip = await helpers.translate('You are not authorized to edit queries');
        api.setState('editButtonToolTip', editButtonToolTip);
    const createScheduleButtonToolTip = await helpers.translate('You are not authorized to create a schedule');
        api.setState('createScheduleButtonToolTip', createScheduleButtonToolTip);
  }
  
}
