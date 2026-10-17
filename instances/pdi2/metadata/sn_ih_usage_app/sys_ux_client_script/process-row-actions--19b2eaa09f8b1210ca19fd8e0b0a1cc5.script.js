/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {

    var actionId = '';
    if (event && event.payload && event.payload.actionItem)
        actionId = event.payload.actionItem.id;
    else
        return;

    if (actionId == 'view_aggregate_breakdown') {
        var typeMap = {
            EXPORTURI: 'export',
            APIREST: 'rest',
            APIJSONV2: 'json',
            EXPORTSET: 'export',
            APISOAP: 'soap'
        };

        if (event && event.payload && event.payload.context && event.payload.context.row && event.payload.context.row.cells && event.payload.context.row.cells.agg_period && event.payload.context.row.cells.source) {
            var source = event.payload.context.row.cells.source.value;
            var agg_period = event.payload.context.row.cells.agg_period.value;
            var dateFilter = "sys_created_onBETWEENjavascript:gs.dateGenerate('" + agg_period+ "','00:00:00')@javascript:gs.dateGenerate('" + agg_period + "','23:59:59')";
            api.emit("NAV_ITEM_SELECTED", {
                "route": "ih-usage-list",
                "fields": {
                    "table": source == 'EXPORTSET' ? "sys_export_set_run" : "syslog_transaction",
                },
                "params": {
                    "listTitle": source == 'EXPORTSET' ? 'Export History' : "Transaction Log",
                    "query": (source != 'EXPORTSET' ? 'type=' + typeMap[source] : '') + "^" + dateFilter

                }
            });
        }

    }
}
