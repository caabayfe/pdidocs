/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const metadata = [{
            "id": "last_24_hours",
            "label": await helpers.translate("Last 24 hours"),
            "show": "latest",
            "noOfPeriod": 7,
            "period": "D",
            "showChangeFrom": "previous"
        },
        {
            "id": "last_7_days",
            "label": await helpers.translate("Last 7 days"),
            "show": "sum",
            "noOfPeriod": 7,
            "period": "D",
            "showChangeFrom": "previous_aggregate"
        },
        {
            "id": "last_1_month",
            "label": await helpers.translate("Last 1 month"),
            "show": "sum",
            "noOfPeriod": 1,
            "period": "M",
            "showChangeFrom": "previous_aggregate"
        }
    ];

    api.setState('whatsNewMetadata', metadata);
}
