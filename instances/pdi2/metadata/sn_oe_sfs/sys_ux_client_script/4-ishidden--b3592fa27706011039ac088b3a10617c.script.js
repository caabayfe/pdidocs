/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({
    api,
    helpers
}) {
    let totalScreens = api.context.props.payload.children.length;
    if (totalScreens >= 5) {
        return false;
    } else {
        return true;
    }
}
