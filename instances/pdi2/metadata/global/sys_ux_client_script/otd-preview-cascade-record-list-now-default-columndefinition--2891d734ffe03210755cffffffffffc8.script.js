/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const columns = [{
            key: "table",
            label: helpers.translateSync("Table"),
            type: "string"
        },
        {
            key: "preview_record_count",
            label: helpers.translateSync("Estimate Record Count"),
            type: "string"
        },
        {
            key: "sys_created_on",
            label: helpers.translateSync("Created"),
            type: "string"
        },
        {
            key: "sys_created_by",
            label: helpers.translateSync("Created By"),
            type: "string"
        }
    ];
    // Show actual record count in case of completed rule
    const ruleData = api.data.rule_management_dmc.ruleData;
    if (ruleData && ruleData["onetime_delete"]) {
        const state = ruleData["onetime_delete"].state;
        if (state == "complete") {
            columns.splice(1, 0, {
                key: "actual_record_count",
                label: helpers.translateSync("Actual record count"),
                type: "string"
            });
        }
    }
    return {
        columns: columns
    };
}
