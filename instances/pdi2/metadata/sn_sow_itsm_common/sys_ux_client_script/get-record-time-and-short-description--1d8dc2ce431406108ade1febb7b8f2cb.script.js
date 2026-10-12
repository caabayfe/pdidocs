/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
  let data = api.data.get_caller_records.output;
  let table = api.context.props.table;
  let recordTimeAndShortDesc = {};
  let sowDateTimeHelper = imports['sn_sow.SOWDateTimeHelper']();
  for(const item of data) {
    let createdOn = item.sys_created_on;
    let sysId = item.sys_id;
    let createOnNowDateTime = sowDateTimeHelper.getNowDateTime(createdOn,'YYYY-MM-DD HH:mm:ss');
    let relativeTimeStr = await sowDateTimeHelper.getRelativeTimeAsync(helpers,createOnNowDateTime);
    let timeAndShortDesc = relativeTimeStr + " - " + item.short_description;
    recordTimeAndShortDesc[sysId] = timeAndShortDesc;
  }
  api.setState("recordTimeAndShortDesc",recordTimeAndShortDesc);
}
