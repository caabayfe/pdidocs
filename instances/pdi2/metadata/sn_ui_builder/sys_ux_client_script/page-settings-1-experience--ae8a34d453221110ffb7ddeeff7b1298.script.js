/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({api, helpers}) {
  if (api.context.props.subroutes?.length > 0 && !!api.context.props.parentScreenId) {
	// when we are in a sub page, pass the fields (required parameters) of parent page.
	const experienceScreens = (
		api.context.props.experience?.routes||[]
	).flatMap((r) => r?.screenCollection?.screens);
	const parentScreen = experienceScreens?.find(
		(s) => s?.sysId === api.context.props.parentScreenId
	);
	const parentScreenCollectionId = parentScreen?.screenCollectionId;
	const parentRoute = api.context.props.experience?.routes?.find(
		(r) => r?.screenCollection?.sysId === parentScreenCollectionId
	);
	return {
		...(api.context.props.experience ?? {}),
		routes: api.context.props.subroutes,
		parentRouteFields: parentRoute?.fields,
		parentScreenCondition: parentScreen?.screenCondition
	};
  }
  return api.context.props.experience;
}
