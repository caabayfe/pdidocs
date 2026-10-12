/**
    * @param {params} params
    * @param {api} params.api
    * @param {TransformApiHelpers} params.helpers
    */
    function evaluateProperty({api, helpers}) {
      if (api.data.sub_ent_record.result == null) return helpers.translateSync('Not Applicable');
      return api.data.sub_ent_record.result.meter_type.displayValue || helpers.translateSync('Not Applicable');
}
