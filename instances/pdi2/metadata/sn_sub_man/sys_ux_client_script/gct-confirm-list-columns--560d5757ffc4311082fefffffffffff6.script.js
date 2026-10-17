/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const issuesTabID = api.state.issuesTabID;
  switch(issuesTabID) {
    case 't1':
      return 'table_name,recommendation_product';
    case 't2':
      return 'name,recommendation_product';
    default:
      return 'table_name,recommendation_product';
  }
}
