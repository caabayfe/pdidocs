/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {

  if(api.state.template.master_ci_option && api.state.template.master_ci_option == "conditional" && api.state.template.main_ci_condition.startsWith("discovery_source=")) {
    let source = api.state.template.main_ci_condition.substr(17);
    if(Array.isArray(api.data.get_all_ms_data_sources_composite__rest_2.dataSourcesWithSublabel) && api.data.get_all_ms_data_sources_composite__rest_2.dataSourcesWithSublabel.find(x => x.id === source)){
        return false;
    }
  }
  return true;
}
