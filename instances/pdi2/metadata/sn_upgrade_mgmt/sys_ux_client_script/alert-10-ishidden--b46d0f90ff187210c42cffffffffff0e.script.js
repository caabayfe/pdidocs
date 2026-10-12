/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.context.props.experienceProperties?.session_type?.value === 'bulk_app_update'){
    return true;
  }
    let activityState = api.context.props.activityState.value;
    let is_post_lane = api.state.isPostLane;

    console.log("post activity state", activityState);
    console.log("is_post_lane", is_post_lane);
    console.log("api.state.disableEdit", api.state.disableEdit)

    if(activityState === undefined)
        activityState = "IN_PROGRESS";

	return api.state.showEditLoading || api.state.disableEdit || (is_post_lane) || activityState === "IN_PROGRESS";
}
