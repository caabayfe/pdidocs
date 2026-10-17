/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let errorState = api.state.errorState;
    var tabType = api.context.props.tabType;
    var content = "";
    if (api.data.record.form.fields && api.data.record.form.fields.active && api.data.record.form.fields.active.value == "false") return content;
    else if (errorState)
        content = helpers.translateSync("A technical error occured. Please contact your system administrator to know more.");
    else {
        if (api.state.permissions.add_adhoc_communication) {
            if (tabType == "Communicate")
                content = helpers.translateSync("You can create a new communication or have an admin configure a plan");
            else if (tabType == "Collaborate")
                content = helpers.translateSync("You can create a new collaboration or have an admin configure a plan");
        }
    }
    return content;
}
