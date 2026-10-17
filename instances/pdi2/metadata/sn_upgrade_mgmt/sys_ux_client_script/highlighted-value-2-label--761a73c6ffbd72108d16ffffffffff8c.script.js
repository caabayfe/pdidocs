/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
    var result = api.data.get_gc_suite_versions?.output;
    
    // Get installed version from result
    var installedVersion = result?.installedVersion;
    
    // Return installed version if exists, otherwise 'None'
    return installedVersion ? 'Installed Suite: ' + installedVersion : 'Installed: None';
}
