/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if (api.context.session.user.roles.includes("sn_vsc.security_center_admin") || api.context.session.user.roles.includes("admin")) {
    var overdue_count = api?.data?.get_customer_action_count_1?.output?.overdueCA;
    if (overdue_count) {
      return helpers.translateSync('{0} overdue', overdue_count);
    }
  }
  return '';
}
