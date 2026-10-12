/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
    const issuesTabID = api.state.issuesTabID;
    switch(issuesTabID) {
    case 't1':
      return helpers.translateSync('Map the global custom tables to these products?');
    case 't2':
      return helpers.translateSync('Map the custom applications to these products?');
    default:
      return helpers.translateSync('Map the global custom tables to these products?');
  }
}
