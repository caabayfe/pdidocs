/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  return [{
      isDatabaseView: false,
      allowRealTime: true,
      label: helpers.translateSync("Utilization by month"),
      sourceType: "table",
      tableOrViewName: "ua_defn_agg_data",
      reportSourceSysId: null,
      filterQuery: "sys_created_on<javascript:gs.beginningOfToday()^sys_created_onONLast 12 months@javascript:gs.beginningOfLast12Months()@javascript:gs.endOfLast12Months()^definition_id=DEFN2004047",
      id: "dGFibGVzdF9saWNlbnNlX2RldGFpbF9tZXRyaWMxNjY5MTYwNjMxMzM4",
      dataCategories: ['trend', 'group', 'simple'],
      randomStateVariable: api.state.listRefresh
  }];
}
