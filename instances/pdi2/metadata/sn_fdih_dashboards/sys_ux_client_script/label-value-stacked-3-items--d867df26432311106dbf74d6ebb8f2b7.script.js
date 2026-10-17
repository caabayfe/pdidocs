/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) { 
  switch (api.data.get_flow_reporting.items[2].value) {
    case 'OFF':
      return [{"label":helpers.translateSync('Flow Reporting'),"value":{"type":"string","value":helpers.translateSync('OFF')}}];
      break;
    case 'FLOW':
      return [{"label":helpers.translateSync('Flow Reporting'),"value":{"type":"string","value":helpers.translateSync('FLOW')}}];
      break;
    case 'ACTION':
      return [{"label":helpers.translateSync('Flow Reporting'),"value":{"type":"string","value":helpers.translateSync('ACTION')}}];
      break;
    case 'ON':
      return [{"label":helpers.translateSync('Flow Reporting'),"value":{"type":"string","value":helpers.translateSync('ON')}}];
      break;
    case 'TRACE':
      return [{"label":helpers.translateSync('Flow Reporting'),"value":{"type":"string","value":helpers.translateSync('TRACE')}}];
      break;
    }
}
