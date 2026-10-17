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
    var tableDetails;
    const notifDashboardUtils = imports["sn_notif_dashboard.NotificationDashboardUtils"]();

    switch (event.elementId) {
        case "presentational_list_3":
            tableDetails = {
                tableName: "topRecipientsAndNotificationsTable",
                restEndPoint: '/api/snc/notification_dashboard/notifications/email/top/notifications_for_a_recipient',
                keyName: "user",
                headerType: "top_recipients_to_notifications",
                childKeyName: "notificationSysId"
            }
            break;
        case "presentational_list_4":
            tableDetails = {
                tableName: "topTablesAndNotificationsTable",
                restEndPoint: '/api/snc/notification_dashboard/notifications/email/top/notifications_for_a_table',
                keyName: "table",
                headerType: "top_tables_to_notifications",
                childKeyName: "notificationSysId"
            }
            break;
    }

    var expandedGroupNode = event.payload.groupContext;
    var keyValue = expandedGroupNode.key;
    var originalRecord = api.state[tableDetails.tableName].rows.find(function(node) {
        return node.key == keyValue
    });
    
    function shouldExpandChildren(originalRecord) {
        if (!originalRecord.children || originalRecord.children.length == 0)
            return true;
        var firstChild = originalRecord.children[0];
        return firstChild.type == 'custom' && firstChild.componentTag == 'now-loader';
    }

    if (shouldExpandChildren(originalRecord)) {
        loadChildren(tableDetails, keyValue);
    }

    function loadChildren(tableDetails, keyValue) {
        const body = {};
        body[tableDetails.keyName] = keyValue;
        var dateFilter = api.state.parFilters.find(function(filter) {
            return filter.filterId == "1i7dvog14394jad005vg";
        });
        body.startDate = dateFilter.start;
        body.endDate = dateFilter.end;
        helpers.snHttp(tableDetails.restEndPoint, {
            method: 'POST',
            body,
            batch: false
        }).then(({
            response
        }) => {
            updateTable(tableDetails, keyValue, response.result);
        });
    }

    function updateTable(tableDetails, keyValue, response) {
        api.setState(tableDetails.tableName, ({
            currentValue,
            api
        }) => {
            var newTable = {};
            newTable.rows = currentValue.rows.map(function(row) {
                return Object.assign({}, row);
            });
            var expandedRow = newTable.rows.find(function(node) {
                return node["key"] == keyValue;
            });
            expandedRow.isGroupExpanded = true;
            expandedRow.children = notifDashboardUtils.generateTable(tableDetails.headerType, response, {
                prefix: keyValue,
                key: tableDetails.childKeyName
            }).rows;
            return newTable;
        });
    }
}
