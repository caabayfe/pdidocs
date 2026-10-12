/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
    const issuesTabID = api.state.issuesTabID;
    switch(issuesTabID) {
    case 't1':
      return 'global_custom_tables_recommendation';
    case 't2':
      return 'custom_applications_recommendation';
    default:
      return 'global_custom_tables_recommendation';
  }
}
