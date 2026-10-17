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
    const TOP_RECIPIENTS_N_NOTIFICATIONS_OVERLAY = "topRecipientsAndNotificationsOverlayMessage";
    const TOP_TABLES_N_NOTIFICATIONS_OVERLAY = "topTablesAndNotificationsOverlayMessage";
    const TOP_OPTOUT_NOTIFICATIONS_OVERLAY = "topOptoutOverlayMessage";
    const TOP_NOTIFICATIONS_OVERLAY = "topNotificationOverlayMessage";
    const mergePARFiltersV2 = imports["global.mergePARFilters"]().v2;
    const notifDashboardUtils = imports["sn_notif_dashboard.NotificationDashboardUtils"](helpers);

    function getOverlayForTab(tab) {
        return tab == "most_triggered" ? TOP_NOTIFICATIONS_OVERLAY : TOP_OPTOUT_NOTIFICATIONS_OVERLAY;
    }
    switch (event.name) {
        case "UXF_TAB_SET#TAB_SELECTED":
            const selectedTab = event.payload.selectedTab.replace("id=", "");
            const overlayProperty = getOverlayForTab(selectedTab);
            setOverlayMessage(overlayProperty, "onload");
            api.setState("selectedTab", ({
                currentValue,
                api
            }) => {
                var dateFilter = getDateFilter2(api.state.parFilters);
                if (dateFilter) {
                    renderTab(selectedTab, dateFilter, false);
                }
                return selectedTab;
            });
            break;

        case "SN_COMPONENT_FILTER#APPLIED_ITEMS":
            const {
                appliedFilters
            } = event.payload;
            var updatedDateFilter = getDateFilter2(appliedFilters);
            if (!updatedDateFilter.start)
                return;
            setOverlayMessage(TOP_RECIPIENTS_N_NOTIFICATIONS_OVERLAY, "onload");
            setOverlayMessage(TOP_TABLES_N_NOTIFICATIONS_OVERLAY, "onload");
            setOverlayMessage(getOverlayForTab(api.state.selectedTab), "onload");
            if (api.state.isFirstBackendCall) {
                api.setState("defaultDateFilter", updatedDateFilter);
                api.setState("isFirstBackendCall", false);
            }
            if (api.state.parFilters)
                notifDashboardUtils.normaliseDateFilter(updatedDateFilter, api.state.defaultDateFilter);
            api.setState("parFilters", ({
                currentValue,
                api
            }) => {
                const {
                    parFilters,
                    encodedQueries
                } = mergePARFiltersV2(
                    currentValue,
                    appliedFilters
                );
                api.setState("encodedQueries", encodedQueries);
                applyLoadingIndicators();
                handleDateFilter(parFilters);
                renderContent(api.state.selectedTab, parFilters, true);
                return parFilters;
            });
        
            break;
    }

    function applyLoadingIndicators() {
        var loadingObj = {
            "isLoading": true,
            "showError": false
        };
        var unusedObj = Object.assign(api.state.newNotificationsCount, loadingObj);
        var optedObj = Object.assign(api.state.oldNotificationsCount, loadingObj);
        api.setState("newNotificationsCount", unusedObj);
        api.setState("oldNotificationsCount", optedObj);
    }
    function setStateMessage(componentJSON, type) {
        notifDashboardUtils.getStateMessage(type).then(overLayConfig => {
            var responseObj = {};
            responseObj.errorText = overLayConfig.message;
            responseObj.showError = true;
            responseObj.isLoading = false;
            api.setState(componentJSON, responseObj);
        });
    }
    function handleDateFilter(parFilters) {
        var parentDateFilter = getDateFilter2(parFilters);
        api.setState("dateJSON", {
            start: parentDateFilter.start,
            end: parentDateFilter.end,
            dynamicTimeRange: parentDateFilter.dynamicTimeRange
        });
        api.setState("dateJSON", parentDateFilter);
        var presentDuration = {};
        var pastDuration = {};
        var completeDuration = {};
        var now = new Date();
        var presentDate = now.getDate();
        var newdate = new Date(now.setMonth(now.getMonth() - 1));
        var prevMonth = newdate.toLocaleString('default', {
            month: 'long'
        }) + ', ' + newdate.getFullYear();
        presentDuration.startDate = parentDateFilter.start;
        presentDuration.endDate = parentDateFilter.end;
        if (parentDateFilter.dynamicTimeRange == "SN_DYNAMIC_DATERANGE__LAST_WEEK") {
           helpers.translate("Weekly email notifications trend").then((translationMessage)=>{
           api.setState("trendTitle", translationMessage);
           });
            api.setState("previousDurationTitle", prevMonth);
            var presentStartDate = new Date(parentDateFilter.start);
            var presentEndDate = new Date(parentDateFilter.end);
            var pastStartDate = new Date(presentStartDate.setDate(presentStartDate.getDate() - 7));
            var pastEndDate = new Date(presentEndDate.setDate(presentEndDate.getDate() - 7));
            pastDuration.startDate = pastStartDate.toISOString().split('T')[0]; 
            pastDuration.endDate = pastEndDate.toISOString().split('T')[0]; 
            prevMonth = pastStartDate.getDate() + ' ' + pastStartDate.toLocaleString('default', {
                month: 'short'
            }) + ' ' + pastStartDate.getFullYear() + ' - ' + pastEndDate.getDate() +  ' ' + pastEndDate.toLocaleString('default', {
                month: 'short'
            }) + ' ' + pastEndDate.getFullYear();
             api.setState("previousDurationTitle", prevMonth);
        } else if (parentDateFilter.dynamicTimeRange == "SN_DYNAMIC_DATERANGE__LAST_MONTH") {
            helpers.translate("Monthly email notifications trend").then((translationMessage)=>{
              api.setState("trendTitle", translationMessage);
            });
            var date = new Date();
            date.setMonth(date.getMonth() - 2);
            date.setDate(1);
            pastDuration.startDate = [
                date.getFullYear(),
                String(date.getMonth() + 1).padStart(2, '0'), // Month is 0-indexed
                String(date.getDate()).padStart(2, '0')
            ].join('-');
            date = new Date();
            date.setMonth(date.getMonth() - 1);
            date.setDate(0);
            pastDuration.endDate = [
                date.getFullYear(),
                String(date.getMonth() + 1).padStart(2, '0'), // Month is 0-indexed
                String(date.getDate()).padStart(2, '0')
            ].join('-');
            prevMonth = date.toLocaleString('default', {
                month: 'long'
            }) + ', ' + date.getFullYear();
            api.setState("previousDurationTitle", prevMonth);
        } else if (parentDateFilter.dynamicTimeRange == "SN_DYNAMIC_DATERANGE__LAST_QUARTER" || parentDateFilter.dynamicTimeRange == "SN_DYNAMIC_DATERANGE__LAST_3_MONTH") {
            if (parentDateFilter.dynamicTimeRange == "SN_DYNAMIC_DATERANGE__LAST_3_MONTH")
                helpers.translate("Last 3 months email notifications trend").then((translationMessage)=>{
                  api.setState("trendTitle", translationMessage);
                });
           else
                helpers.translate("Quarterly email notifications trend").then((translationMessage)=>{
                  api.setState("trendTitle", translationMessage);
                });
            var dateEnd = new Date(parentDateFilter.start);
            var quarterEnd = new Date(dateEnd.setMonth(dateEnd.getMonth() - 1));
            var dateStart = new Date(parentDateFilter.start);
            var quarterStart = new Date(dateStart.setMonth(dateStart.getMonth() - 3));
            var prevQuarter = quarterStart.toLocaleString('default', {
                month: 'short'
            }) + ' ' + quarterStart.getFullYear() + ' - ' + quarterEnd.toLocaleString('default', {
                month: 'short'
            }) + ' ' + quarterEnd.getFullYear();
            api.setState("previousDurationTitle", prevQuarter);
            pastDuration.startDate = [
                quarterStart.getFullYear(),
                String(quarterStart.getMonth() + 1).padStart(2, '0'), // Month is 0-indexed
                String(quarterStart.getDate()).padStart(2, '0')
            ].join('-');
            pastDuration.endDate = [
                quarterEnd.getFullYear(),
                String(quarterEnd.getMonth() + 1).padStart(2, '0'), // Month is 0-indexed
                String(quarterEnd.getDate()).padStart(2, '0')
            ].join('-');
        } else if (parentDateFilter.dynamicTimeRange == "SN_DYNAMIC_DATERANGE__YESTERDAY") {
            helpers.translate("Daily email notifications trend").then((translationMessage)=>{
                  api.setState("trendTitle", translationMessage);
                });
            api.setState("previousDurationTitle", prevMonth);
            var today = new Date(parentDateFilter.start);
            var yesterday = new Date(today.setDate(today.getDate() - 1));
            pastDuration.startDate = yesterday.toISOString().split('T')[0]; 
            pastDuration.endDate = yesterday.toISOString().split('T')[0]; 
            prevMonth = yesterday.getDate() + ' ' + yesterday.toLocaleString('default', {
                month: 'short'
            }) + ' ' + yesterday.getFullYear();
            api.setState("previousDurationTitle", prevMonth);
        } else if (parentDateFilter.dynamicTimeRange == "SN_DYNAMIC_DATERANGE__LAST_3_MONTH") {

        }
        api.setState("previousDurationJSON", pastDuration);
        completeDuration.startDate = pastDuration.startDate;
        completeDuration.endDate = presentDuration.endDate;
        api.setState("completeDurationJSON", completeDuration);

        helpers.snHttp('api/snc/notification_dashboard/notifications/email/newnotifications', {
            method: 'POST',
            batch: false,
            body: {
                startDate: parentDateFilter.start + ' 00:00:00',
                endDate: parentDateFilter.end + ' 23:59:59'
            }
        }).then(({
            response
        }) => {
            if (response.result == undefined || response.result.length == 0) {
                   setStateMessage("newNotificationsCount", "zero_results");
            } else {
                            var responseObj = {};
                responseObj.showError = false;
                Object.assign(responseObj, response.result);
            responseObj.isLoading = false;
            api.setState("newNotificationsCount", responseObj);
            }
        }).catch(({
            error
        }) => {
            setStateMessage("newNotificationsCount", "error");
            console.error("error while fetching the content");
        });

        helpers.snHttp('api/snc/notification_dashboard/notifications/email/newnotifications', {
            method: 'POST',
            batch: false,
            body: {
                startDate: pastDuration.startDate + ' 00:00:00',
                endDate: pastDuration.endDate + ' 23:59:59'
            }
        }).then(({
            response
        }) => {
            if (response.result == undefined || response.result.length == 0) {
                setStateMessage("oldNotificationsCount", "zero_results");
            } else {
                 var responseObj = {};
                responseObj.showError = false;
                Object.assign(responseObj, response.result);
            responseObj.isLoading = false;
            api.setState("oldNotificationsCount", responseObj);
            }
        }).catch(({
            error
        }) => {
            setStateMessage("oldNotificationsCount", "error");
            console.error("error while fetching the content");
        });
        var l = {};
        l.startQuery = "javascript:gs.dateGenerate(" + parentDateFilter.start + ",' 00:00:00')";
        l.endQuery = "javascript:gs.dateGenerate(" + parentDateFilter.end + ",'' 23:59:59')";
        api.setState("presentDurationQueryJSON", l);
    }
    

    function getDateFilter2(parFilters) {
        return parFilters && parFilters.find(function(filter) {
            return filter.filterId == "1i7dvog14394jad005vg";
        });
    }

    function renderContent(tab, parFilters, filterChange) {
        const dateFilter = getDateFilter2(parFilters);
        if (tab)
        renderTab(tab, dateFilter, filterChange);
        renderExpandedTables(dateFilter, filterChange);
    }

    function renderTab(tab, dateFilter, filterChange) {

        var tableName, headerName, endPoint, type;
        if (tab == "most_triggered") {
            tableName = "topNotificationTable";
            headerName = "topNotificationHeader";
            type = "top_notifications";
            endPoint = 'api/snc/notification_dashboard/notifications/email/top';
        } else {
            tableName = "topOptOutNotificationTable";
            headerName = "topOptOutNotificationHeader";
            type = "most_opt_out_notification";
            endPoint = 'api/snc/notification_dashboard/notification/email/top_optedout';
        }
        if (filterChange) {
            api.setState("topNotificationTable", {});
            api.setState("topOptOutNotificationTable", {});
        }

        //create header if not created
        if (!api.state[headerName].hasOwnProperty("columns")) {
            notifDashboardUtils.getHeaders(type).then(headers => { api.setState(headerName, headers);});
        }
        if (filterChange || !api.state[tableName].hasOwnProperty("rows")) {
            helpers.snHttp(endPoint, {
                method: 'POST',
                batch: false,
                body: {
                    startDate: dateFilter.start,
                    endDate: dateFilter.end
                }
            }).then(({
                response
            }) => {
                resetOverlayMessage(getOverlayForTab(tab));
                var tableResult = response.result;
                api.setState(tableName, notifDashboardUtils.generateTable(type, tableResult, {
                    key: "notificationSysId"
                }));
                if (!tableResult || tableResult.length == 0) {
                    setOverlayMessage(getOverlayForTab(tab), "zero_results");
                }
            }).catch(({
                error
            }) => {
                console.error("An error occured while fetching the content: " + error);
                setOverlayMessage(getOverlayForTab(tab), "error");
            });
        } else {
                resetOverlayMessage(getOverlayForTab(tab));
        }

    }

    function renderExpandedTables(dateFilter, filterChange) {
        renderExpandedTable({
            type: "top_recipients_to_notifications",
            headerName: "topRecipientsAndNotificationsHeader",
            tableName: "topRecipientsAndNotificationsTable",
            endPoint: '/api/snc/notification_dashboard/notifications/email/top/recipients_and_its_notification',
            childOptions: {
                key: "notificationSysId"
            },
            childType: "top_recipients_to_notifications",
            overlay: TOP_RECIPIENTS_N_NOTIFICATIONS_OVERLAY
        }, dateFilter, filterChange);
        renderExpandedTable({
            type: "top_tables_to_notifications",
            headerName: "topTablesAndNotificationsHeader",
            tableName: "topTablesAndNotificationsTable",
            endPoint: '/api/snc/notification_dashboard/notifications/email/top/tables_and_its_notification',
            childOptions: {
                key: "notificationSysId"
            },
            childType: "top_tables_to_notifications",
            overlay: TOP_TABLES_N_NOTIFICATIONS_OVERLAY
        }, dateFilter, filterChange);
    }

    function renderExpandedTable(expandedTable, dateFilter, filterChange) {
        if (!api.state[expandedTable.headerName].hasOwnProperty("columns")) {
            notifDashboardUtils.getHeaders(expandedTable.childType).then(headers =>{api.setState(expandedTable.headerName, headers);} );
        }
        if (filterChange || !api.state[expandedTable.tableName].hasOwnProperty("rows")) {
            helpers.snHttp(expandedTable.endPoint, {
                method: 'POST',
                batch: false,
                body: {
                    startDate: dateFilter.start,
                    endDate: dateFilter.end
                }
            }).then(({
                response
            }) => {
                resetOverlayMessage(expandedTable.overlay);
                var tableResult = response.result;
                if (!tableResult || tableResult.length == 0) {
                    setOverlayMessage(expandedTable.overlay, "zero_results");
                }
                api.setState(expandedTable.tableName, notifDashboardUtils.generateGroupedTable(expandedTable.type, tableResult, expandedTable.childOptions, expandedTable.childType));
            }).catch(({
                error
            }) => {
                console.error("An error occured while fetching the content: " + error);
                setOverlayMessage(expandedTable.overlay, "error");
            });
        }

    }

    function setOverlayMessage(propertyName, type) {
        if (propertyName) {
            notifDashboardUtils.getOverlayMessageForTable(type).then(message => {api.setState(propertyName, message);});
        }
    }

    function resetOverlayMessage(propertyName) {
        if (propertyName) {
            api.setState(propertyName, {});
        }
    }
}
