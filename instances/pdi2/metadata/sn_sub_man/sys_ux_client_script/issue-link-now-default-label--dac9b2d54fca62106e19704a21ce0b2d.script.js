/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
    const issuesTabID = api.state.issuesTabID;
    switch(issuesTabID) {
      case 't1':
        return helpers.translateSync('Map missing tables from custom table inventory list');
      case 't2':
        return helpers.translateSync('Map missing applications from custom applications list');
      default:
        return 'global_custom_tables_recommendation';
  }
}
