/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const rows = api.data.get_acl_data_for_skill_config_1.output?.rowPayload?.rows;
  return rows.some(row => row.cells?.roles?.componentProps?.pills?.length > 0);
}
