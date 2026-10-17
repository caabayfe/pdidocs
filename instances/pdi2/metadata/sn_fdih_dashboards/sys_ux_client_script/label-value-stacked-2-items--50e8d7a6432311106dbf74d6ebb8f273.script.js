/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	switch (api.data.get_flow_log_level.items[2].value) {
    case 'DEBUG':
      return [{"label":helpers.translateSync('Log Level'),"value":{"type":"string","value":helpers.translateSync('DEBUG')}}];
      break;
    case 'INFO':
      return [{"label":helpers.translateSync('Log Level'),"value":{"type":"string","value":helpers.translateSync('INFO')}}];
      break;
    case 'WARN':
      return [{"label":helpers.translateSync('Log Level'),"value":{"type":"string","value":helpers.translateSync('WARN')}}];
      break;
    case 'ERROR':
      return [{"label":helpers.translateSync('Log Level'),"value":{"type":"string","value":helpers.translateSync('ERROR')}}];
      break;
    case 'NONE':
      return [{"label":helpers.translateSync('Log Level'),"value":{"type":"string","value":helpers.translateSync('NONE')}}];
      break;
    }
}
