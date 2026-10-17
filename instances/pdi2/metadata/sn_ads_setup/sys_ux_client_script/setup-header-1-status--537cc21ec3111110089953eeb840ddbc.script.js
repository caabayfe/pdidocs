/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
  if(!api.data.get_setup_info.result) {
    return;
  }
  const {status} = api.data.get_setup_info.result;
	return {
    color: (status.value === 'draft' && 'low') || 'info',
    label: status.displayValue
  };
}
