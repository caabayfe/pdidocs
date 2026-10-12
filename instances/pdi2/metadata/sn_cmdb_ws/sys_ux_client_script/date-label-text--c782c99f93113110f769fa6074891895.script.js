/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const savedTime = api.context.props.cb;
  if(savedTime){
	return 'Last saved: '+ new Date(savedTime).toLocaleString();
  }else{
    return '';
  }
  
}
