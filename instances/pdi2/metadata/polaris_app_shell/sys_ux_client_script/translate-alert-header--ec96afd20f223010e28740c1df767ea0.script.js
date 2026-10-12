/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({api, event, helpers, imports}) { 
  if (api.state.approvalAction === 'rejected') { 
    return api.setState('alertHeader', await helpers.translate('The task was rejected')); 
  } else { 
    return api.setState('alertHeader', await helpers.translate('The task was approved')); 
} } 
