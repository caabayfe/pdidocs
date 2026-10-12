/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  return [{
      isDatabaseView: false,
      allowRealTime: true,
      label: helpers.translateSync("Consumption History"),
      sourceType: "table",
      tableOrViewName: "sn_sub_man_st_subscription_license_detail_metric",
      reportSourceSysId: null,
      filterQuery: "type=subscription_allotment_history^subscription="+ api.context.props.sysId,
      id: "dGFibGVzdF9saWNlbnNlX2RldGFpbF9tZXRyaWMxNjY5MTYwNjMxMzM4",
      dataCategories: ['trend', 'group', 'simple'],
      randomStateVariable: api.state.listRefresh
  }];
}
