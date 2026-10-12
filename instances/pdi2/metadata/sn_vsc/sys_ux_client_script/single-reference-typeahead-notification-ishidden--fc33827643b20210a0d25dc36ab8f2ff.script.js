/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  // If its not a glide list, we should render single select typehaed component
  const isGlideList = api?.item?.value?.isGlideList;
  if (!isGlideList) {
    return false;
  }
  return true;
}
