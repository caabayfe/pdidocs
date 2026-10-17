function include({
    imports
}, helpers) {
    const commonNotifHeader = ["NotificationName", "TriggeredCount", "OptedOutCount", "CategoryName", "TableName"];
    const headersList = new Map();
    headersList.set("top_notifications", commonNotifHeader);

    headersList.set("most_trigerred_notification", commonNotifHeader);
    headersList.set("least_trigerred_notification", commonNotifHeader);
    headersList.set("most_opt_out_notification", commonNotifHeader);
    headersList.set("unused_notification", commonNotifHeader);

    headersList.set("top_recipients_to_notifications", ["NotificationName", "TriggeredCount", "CategoryName", "TableName"]);
    headersList.set("top_tables_to_notifications", ["NotificationName", "TriggeredCount", "CategoryName", "TableName"]);
    headersList.set("email_accounts", ["Name", "Type", "Active", "StateCode"]);

    const groupedHeadersList = new Map();
    groupedHeadersList.set("top_recipients_to_notifications", {
        key: "userSysId",
        rowCount: "triggeredCount",
        rowLabel: "userName"
    });
    groupedHeadersList.set("top_tables_to_notifications", {
        key: "tableSysId",
        rowCount: "triggeredCount",
        rowLabel: "tableLabel"
    });

    const getHeaders = async (type) => {
        const headers = headersList.get(type);
        let columns = [];

        for (let i = 0; i < headers.length; i++) {
            switch (headers[i]) {


                case "Name":
                    const nameALabel = await helpers.translate("Account");
                    columns.push({
                        "key": "Name",
                        "label": nameALabel
                    });
                    break;
                case "Active":
                    const stateLabel = await helpers.translate("Status");
                    columns.push({
                        "key": "Active",
                        "label": stateLabel,
                    });
                    break;

                case "Type":
                    columns.push({
                        "key": "Type",
                        "label": "Type",
                    });
                    break;

                case "StateCode":
                    columns.push({
                        "key": "State Code",
                        "label": "State",
                    });
                    break;
                case "NotificationName":
                    const nameLabel = await helpers.translate("Name");
                    columns.push({
                        "key": "NotificationName",
                        "label": nameLabel,
                        "type": "link"
                    });
                    break;
                case "TriggeredCount":
                    const triggerCountLabel = await helpers.translate("Triggered count (times)");
                    columns.push({
                        "key": "TriggeredCount",
                        "label": triggerCountLabel
                    });
                    break;
                case "OptedOutCount":
                    const optCountLabel = await helpers.translate("Opted-out count (users)");
                    columns.push({
                        "key": "OptedOutCount",
                        "label": optCountLabel
                    });
                    break;
                case "CategoryName":
                    const categoryLabel = await helpers.translate("Category name");
                    columns.push({
                        "key": "CategoryName",
                        "label": categoryLabel
                    });
                    break;
                case "TableName":
                    const tableLabel = await helpers.translate("Table name");
                    columns.push({
                        "key": "TableName",
                        "label": tableLabel
                    });
                    break;
            }
        }

        return {
            columns
        };
    };
    const generateGroupedTable = (groupedType, results, childOptions, childType) => {
        const groupedTypeOptions = groupedHeadersList.get(groupedType);
        const rows = results.map((result) => convertGroupedRecord(result, groupedTypeOptions, childOptions, childType));
        return {
            rows
        };
    };

    const convertGroupedRecord = (record, groupedTypeOptions, childOptions, childType) => {
        const result = {
            type: "grouped",
            isGroupExpanded: false
        };
        result.key = record[groupedTypeOptions.key];
        result.groupedRowCount = record[groupedTypeOptions.rowCount];
        result.groupedRowLabel = record[groupedTypeOptions.rowLabel];

        if (record.children) {
            childOptions.prefix = result.key;
            result.children = generateTable(childType, record.children, childOptions).rows;
        } else {
            result.children = [{
                "key": "loader_row" + result.key,
                "type": "custom",
                "componentTag": "now-loader",
                "componentProps": {
                    "size": "lg"
                },
                "contentAlignment": "center"
            }];
        }

        return result;
    };

    const generateTable = (type, results, options) => {
        const headers = headersList.get(type);
        const rows = results.map((result) =>
            convertRecord(result, headers, options)
        );
        return {
            rows
        };
    };
    const convertRecord = (record, headers, options) => {
        var cells = {};
        var key = (options.prefix ? options.prefix + "_" : "") + record[options.key];
        var result = {
            cells,
            key
        };
        for (let i = 0; i < headers.length; i++) {
            switch (headers[i]) {
                case "NotificationName":
                    cells["NotificationName"] = {
                        value: record["notificationSysId"],
                        label: record["notificationName"]
                    };
                    break;


                case "Name":
                    cells["Name"] = {
                        value: record["name"],
                        label: record["name"]
                    };
                    break;

                case "Active":
                    cells["Active"] = {
                        value: record["active"],
                        label: record["active"]
                    };
                    break;

                case "Type":
                    cells["Type"] = {
                        value: record["type"],
                        label: record["type"]
                    };
                    break;

                case "RetryCount":
                    cells["Retry Count"] = {
                        value: record["retryCount"],
                        label: record["retryCount"]
                    };
                    break;

                case "WorkerStatus":
                    cells["Worker Status"] = {
                        value: record["WorkerStatus"] ? record["WorkerStatus"] : "",
                        label: record["WorkerStatus"] ? record["WorkerStatus"] : ""
                    };
                    break;
                case "StateCode":
                    cells["State Code"] = {
                        value: record["stateCode"] ? record["stateCode"] : "",
                        label: record["stateCode"] ? record["stateCode"] : ""
                    };
                    break;
                case "Message":
                    cells["Message"] = {
                        value: record["message"] ? record["message"] : "",
                        label: record["message"] ? record["message"] : ""
                    };
                    break;

                case "TriggeredCount":
                    var triggeredCount = record["triggeredCount"] ? record["triggeredCount"] : 0;
                    cells["TriggeredCount"] = {
                        value: triggeredCount
                    };
                    break;

                case "OptedOutCount":
                    var optOutCount = record["notificationPreferenceOptOutCount"] ? record["notificationPreferenceOptOutCount"] : 0;
                    var totalCount = record["notificationTotalPreferenceCount"] ? record["notificationTotalPreferenceCount"] : 0;
                    cells["OptedOutCount"] = {
                        value: optOutCount + "/" + totalCount
                    };
                    break;

                case "CategoryName":
                    cells["CategoryName"] = {
                        value: record["categoryName"]
                    };
                    break;

                case "TableName":
                    const displayValue = record["tableName"] ? record["tableLabel"] + " [ " + record["tableName"] + " ] " : "";
                    cells["TableName"] = {
                        value: displayValue
                    };
                    break;

            }
        }
        return result;
    };

    const getOverlayMessageForTable = async (type) => {
        let result = {};
        switch (type) {
            case "onload":
                const loadLabel = await helpers.translate("Loading data");
                result = {
                    "type": "loader",
                    "loaderConfig": {
                        "label": loadLabel
                    }
                };
                break;
            case "error":
                const errorLabel1 = await helpers.translate("Error occured");
                const errorLabel2 = await helpers.translate("Error occurred. Please try again");
                result = {
                    "type": "message",
                    "showColumnHeaders": true,
                    "messageConfig": {
                        "content": errorLabel2,
                        "heading": {
                            "label": errorLabel1,
                            "level": 1
                        },
                        "illustration": "error"
                    }
                };
                break;
            case "zero_results":
                const zeroResultsLabel = await helpers.translate("No data found");
                result = {
                    "type": "message",
                    "showColumnHeaders": true,
                    "messageConfig": {
                        "heading": {
                            "label": zeroResultsLabel,
                            "level": 1
                        },
                        "illustration": "no-data"
                    }
                };
                break;
        }
        return result;
    };

    const getStateMessage = async (type) => {
        let result = {};
        switch (type) {
            case "error":
                const errorLabel = await helpers.translate("Error occurred. Please try again");
                result = {
                    "message": errorLabel
                };
                break;
            case "zero_results":
                const zeroResultsLabel = await helpers.translate("No data found");
                result = {
                    "message": zeroResultsLabel
                };
                break;
        }
        return result;
    };
    /*
      PAR dashboard always retrives the hitoric values and doesn't hold information about today. So, API is designed to change the date filter to default value when today is selected(This happens whenever user unselects the date filter and apply it).
    */
    const normaliseDateFilter = (dateFilter, defaultValue) => {
        if (dateFilter && dateFilter.start == dateFilter.end) {
            const today = new Date();
            let todayDate = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
            if (todayDate == dateFilter.start) {
                dateFilter.start = defaultValue.start;
                dateFilter.end = defaultValue.end;
                dateFilter.dynamicTimeRange = defaultValue.dynamicTimeRange;

                return dateFilter;
            }
        }
        return dateFilter;
    };

    return {
        generateTable,
        generateGroupedTable,
        getHeaders,
        getOverlayMessageForTable,
        getStateMessage,
        normaliseDateFilter
    };
}
