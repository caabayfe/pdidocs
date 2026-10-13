/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (!api.state.permissions.add_adhoc_communication || api.state.errorState) return [];
    if (api.data.record.form.fields && api.data.record.form.fields.active && api.data.record.form.fields.active.value == "false") return [];
    var tabType = api.context.props.tabType;
    var label = tabType == "Communicate" ? helpers.translateSync("Create new communication") :
        tabType == "Collaborate" ? helpers.translateSync("Create new collaboration") : "";
    return [{
        "label": label,
        "variant": "primary",
        "tooltipContent": label
    }];
}
