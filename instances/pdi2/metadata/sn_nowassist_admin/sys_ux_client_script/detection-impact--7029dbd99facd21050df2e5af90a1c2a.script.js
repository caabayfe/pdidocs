/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const detectionImpact = api?.data?.prompt_injection_detection_impact?.output;
    let detectionImpactLabel = ''
    switch(detectionImpact){
        case 'MONITOR':
        detectionImpactLabel = await helpers.translate('Log only');
        break;
        case 'BLOCK':
          detectionImpactLabel = await helpers.translate('Block and log');
        break;
        case 'OFF':
        default:
          detectionImpactLabel = ''
    }
    api.setState('detectionImpactLabel', detectionImpactLabel);

}
