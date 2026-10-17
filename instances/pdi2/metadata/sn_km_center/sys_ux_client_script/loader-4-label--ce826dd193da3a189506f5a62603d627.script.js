/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.context.props.duplicateSysIds) {
      var arr = api.context.props.duplicateSysIds.split(',');
      var length = arr.length;
      return helpers.translateSync('Merging ${0} duplicate articles...', length);
  } else {
      return helpers.translateSync('Merging duplicate articles...');
  }
}
