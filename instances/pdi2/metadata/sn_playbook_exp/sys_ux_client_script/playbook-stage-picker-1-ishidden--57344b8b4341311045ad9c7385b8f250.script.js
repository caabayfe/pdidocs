/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const hideStagePicker = api.context.props.hideStagePicker;
  
  return (hideStagePicker === true || hideStagePicker === 'true');
}
