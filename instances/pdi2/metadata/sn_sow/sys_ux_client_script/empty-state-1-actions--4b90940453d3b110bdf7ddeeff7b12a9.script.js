/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
    const addButton = {
        label: helpers.translateSync("Add members"),
        variant: "secondary"
    };

    if (api.context.session.user.roles.includes("admin") || api.context.session.user.roles.includes("sn_sow_srm.srm_admin"))
      return [addButton];
    
    //expose add button if manager of team
    if (!api.data.record.form)
        return [];

    const managerId = api.data.record.form.fields.manager.value || "";

    if (managerId === api.context.session.user.sys_id)
        return [addButton];

    return [];
}
