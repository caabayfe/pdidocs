/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const STATUS_IN_PROGRESS = 'in_progress';
  const WAITING = 'waiting';
  let guidanceStatus = api.context.props.status;
  if (guidanceStatus === STATUS_IN_PROGRESS || guidanceStatus === WAITING){
    return false;
  } else{
    return true;
  }
}
