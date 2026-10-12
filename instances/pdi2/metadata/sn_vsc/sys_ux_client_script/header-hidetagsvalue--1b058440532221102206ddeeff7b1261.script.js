/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	// hide tags for non-admins, otherwise use default value
	if (!(api.context.session.user.roles.includes("sn_vsc.security_center_admin") || api.context.session.user.roles.includes("admin"))) {
		return true;
	}
	return api.data.page_props.output.hide_tags;
}
