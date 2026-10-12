function script({ api, event, helpers, imports }) {
  const results = event.payload.data.output;
  if (!results) return;

  const { hasDuplicates, duplicatePolicySysId } = results;
  var duplicatePolicyLink = {};
  var link = "";
  if (hasDuplicates) {
    if (duplicatePolicySysId.length == 1) {
      link =
        "/now/cmdb/management/sub/data-manager-policy-details/" +
        duplicatePolicySysId[0];
      duplicatePolicyLink = {
        href: link,
        iconEnd: "open-link-right-outline",
        label: "Open Policy",
        opensWindow: true,
      };
    } else {
      const sysIds = duplicatePolicySysId.join(",");
      link =
        "now/cmdb/management/sub/list/cmdb_data_management_policy_runtime_attributes/params/list-title/Duplicate%20Policies/fixed-filter/policy.sys_idIN" +
        encodeURIComponent(sysIds) +
        "/columns/policy.name%2Cpolicy.cmdb_policy_type%2Cpolicy.task_assignment_type%2Cpolicy.assignee%2Cpolicy.description/hide-actions/true";
      duplicatePolicyLink = {
        href: link,
        iconEnd: "open-link-right-outline",
        label: "Open Policy",
        opensWindow: true,
      };
    }
    api.setState("isPolicyDuplicate", true);
    api.setState("duplicatePolicyLink", duplicatePolicyLink);
  } else {
    api.setState("isPolicyDuplicate", false);
  }
}
