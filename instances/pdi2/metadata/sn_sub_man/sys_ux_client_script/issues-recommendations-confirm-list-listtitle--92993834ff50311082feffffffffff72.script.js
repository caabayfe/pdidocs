/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
    const issuesTabID = api.state.issuesTabID;
    switch(issuesTabID) {
    case 't1':
      return helpers.translateSync('Selected global custom tables');
    case 't2':
      return helpers.translateSync('Selected custom applications');
    default:
      return helpers.translateSync('Selected global custom tables');
  }
}
