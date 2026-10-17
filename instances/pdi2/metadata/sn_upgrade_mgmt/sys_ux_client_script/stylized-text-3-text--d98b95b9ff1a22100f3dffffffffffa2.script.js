/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const state = api.data.get_schema_alter_tracker_1.output?.state;
    if (state == 2) {
        return helpers.translateSync("Pre-stage your Schema Alters: Complete");
    } else if (state == 1) {
        return helpers.translateSync("Pre-stage your Schema Alters: In progress");
    } else {
        return helpers.translateSync("Pre-stage your Schema Alters");
    }
}
