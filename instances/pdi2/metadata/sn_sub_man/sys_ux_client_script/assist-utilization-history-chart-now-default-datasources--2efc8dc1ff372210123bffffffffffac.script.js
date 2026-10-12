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
      tableOrViewName: "now_assists_skills",
      reportSourceSysId: null,
      filterQuery: "lookback=1",
      id: "dGFibGVzdF9saWNlbnNlX2RldGFpbF9tZXRyaWMxNjY5MTYwNjMxMzM4",
      dataCategories: ['trend', 'group', 'simple'],
      randomStateVariable: api.state.listRefresh
  }];
}
