/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    // DEF0821025: render nothing until sessionType resolves so neither flow
    // briefly shows the wrong description before state loads.
    if (!api.state.sessionType) {
        return '';
    }
    return api.state.sessionType === "bulk_app_update" ? helpers.translateSync(
        "Review records that are predicted to be skipped when the update occurs. These records will be skipped to avoid conflicts with your customizations. Review the predicted skipped records to select the proper predicted disposition and begin resolving conflicts."
    ) : helpers.translateSync(
        "Review the list of records that are predicted to be skipped when the upgrade occurs. These records were skipped to avoid conflicts with your customizations. Review the predicted skipped records to select the proper predicted disposition and begin resolving conflicts."
    );
}
