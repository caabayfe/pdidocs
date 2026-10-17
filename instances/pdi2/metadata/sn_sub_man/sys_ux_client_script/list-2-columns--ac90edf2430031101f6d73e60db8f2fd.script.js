/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const issuesTabID = api.state.issuesTabID;
  switch(issuesTabID) {
    case 't0':
      return 'gad_group,ugr_subscription';
    case 't1':
      return 'table_name,recommendation_product,reason';
    case 't2':
      return 'name,recommendation_product,reason';
    case 't3':
      return 'subscription,user_allocation_data.user.user_name,user_allocation_data.user.name,group';  
    default:
      return 'table_name,recommendation_product,reason';
  }
}
