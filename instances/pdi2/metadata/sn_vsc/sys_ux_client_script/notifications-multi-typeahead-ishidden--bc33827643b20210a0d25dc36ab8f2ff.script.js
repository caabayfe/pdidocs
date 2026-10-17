/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  // If its a glide list, we should render multi select typehaed component
  const isGlideList = api?.item?.value?.isGlideList;
  if (isGlideList) {
    return false;
  }
  return true;
}
