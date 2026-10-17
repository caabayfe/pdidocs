/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let label;
    let model = api.item.value.propValues.model;
    if (model.table == "sys_ux_banner_announcement") {
        label = model.heading;
    } else {
        label = model.number;
    }
    return {
        "Role": "Link",
        "aria-label": helpers.translateSync("Open announcement record {0}", label)
    };
}
