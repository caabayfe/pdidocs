/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
  const {status} = api.state;
  if(!status)
    return;

	return {
    color: status === 'Draft' && 'low' || 'info' ,
    label: status
  };
}
