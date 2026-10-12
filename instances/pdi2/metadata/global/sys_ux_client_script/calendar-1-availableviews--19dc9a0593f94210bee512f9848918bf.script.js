/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {

    const day = {
        "view": "DAY",
        "viewProvider": "DAY",
        "label": helpers.translateSync("Day"),
        "type": helpers.translateSync("Calendar")
    };

    const work_week = {
        "view": "work_week",
        "viewProvider": "COLUMN",
        "label": helpers.translateSync("Work Week"),
        "type": helpers.translateSync("Calendar")
    };

    const week = {
        "view": "WEEK",
        "viewProvider": "WEEK",
        "label": helpers.translateSync("Week"),
        "type": helpers.translateSync("Calendar")
    };

    const month = {
        "view": "MONTH",
        "viewProvider": "MONTH",
        "label": helpers.translateSync("Month"),
        "type": helpers.translateSync("Calendar")
    };

    const timeline_day = {
        "view": "TIMELINE_DAY",
        "viewProvider": "TIMELINE_DAY",
        "label": helpers.translateSync("Day"),
        "type": helpers.translateSync("Timeline")
    };

    const timeline_week = {
        "view": "TIMELINE_WEEK",
        "viewProvider": "TIMELINE_WEEK",
        "label": helpers.translateSync("Week"),
        "type": helpers.translateSync("Timeline")
    };

    const timeline_month = {
        "view": "TIMELINE_MONTH",
        "viewProvider": "TIMELINE_CONFIGURABLE_COLUMN",
        "label": helpers.translateSync("4 Weeks"),
        "type": helpers.translateSync("Timeline")
    };
    return [day, work_week, week, month, timeline_day, timeline_week, timeline_month];
}
