/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var instance_name = api?.data?.get_instance_name?.output
  if (instance_name) {
    return helpers.translateSync('Summary for {0}', instance_name);
  }
  return helpers.translateSync('Summary');
}
