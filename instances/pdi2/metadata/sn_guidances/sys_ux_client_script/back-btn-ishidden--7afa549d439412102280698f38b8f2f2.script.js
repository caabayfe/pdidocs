/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  let guidanceActions = api.context.props.guidanceActions;
  for (let i = 0; i < guidanceActions.length; i++) {
        if (guidanceActions[i].actionId && guidanceActions[i].actionId === 'back') {
            return false;
        }
    }
    return true;
}
