/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
    if (api.data.sub_ent_record.result == null) return true;
    return !['Capacity', 'Unrestricted User'].includes(api.data.sub_ent_record.result.subscription_type.displayValue);
}
