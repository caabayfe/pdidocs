/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const latestHistoryId = api.data.mid_server_latest_upgrade.results[0].sys_id.value;
    const startedMids = api.data.mid_server_upgrade_start_count.output.data.GlideAggregate_Query;
    const completedMids = api.data.mid_server_upgrade_completed_count.output.data.GlideAggregate_Query;

    let startedMidSysIds = [];
    startedMids.map(data => startedMidSysIds.push(data.groupBy[0].value));

    let completedMidSysIds = [];
    completedMids.map(data => completedMidSysIds.push(data.groupBy[0].value));

    let incompleteMidSysIds = startedMidSysIds.filter(sysid => !completedMidSysIds.includes(sysid));

    return [{
        "response": {
            "data": [
                [
                    "value"
                ],
                [`${startedMids.length - completedMids.length}`]
            ],
            "metadata": {
                "timeZone": "SESSION",
                "format": {
                    "unitFormat": "{0}"
                },
                "eventData": {
                    "table": "ecc_agent_upgrade_history_stage",
                    "query": `upgrade_history=${latestHistoryId}^mid_serverIN${incompleteMidSysIds}`
                },
                "dataSourceLabel": "MID Server Upgrade History Stage",
                "aggregateBy": 0
            }
        },
        "order": 0
    }];
}
