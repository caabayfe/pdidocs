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
    const {
        appliedFilters
    } = event.payload;
    const updatedDateFilter = getDateFilter(appliedFilters);
    if (!updatedDateFilter.start)
        return;
    const mergePARFiltersV2 = imports["global.mergePARFilters"]().v2;
    const dashboardUtils = imports["sn_notif_dashboard.NotificationDashboardUtils"](helpers);
    //normalise it 
    dashboardUtils.normaliseDateFilter(getDateFilter(appliedFilters), api.state.defaultDateFilter);

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
        var dateFilter = getDateFilter(parFilters);
        applyLoadingIndicators();
        applyDateChanges(dateFilter);
        api.setState("encodedQueries", encodedQueries);
        return parFilters;
    });

    function getDateFilter(parFilters) {
        return parFilters.find(function(filter) {
            return filter.filterId == '1i8liprld11i70d3sbco';
        });
    }

    function applyLoadingIndicators() {
        var loadingObj = {
            "isLoading": true,
            "showError": false
        };
        var tableObj = Object.assign(api.state.mostUsedCategoryJSON, loadingObj);
        var triggerObj = Object.assign(api.state.mostTriggeredNotificationJSON, loadingObj);
        var unusedObj = Object.assign(api.state.unusedNotificationsJSON, loadingObj);
        var optedObj = Object.assign(api.state.mostOptedOutNotificationJSON, loadingObj);
        api.setState("mostTriggeredNotificationJSON", triggerObj);
        api.setState("mostUsedCategoryJSON", tableObj);
        api.setState("unusedNotificationsJSON", unusedObj);
        api.setState("mostOptedOutNotificationJSON", optedObj);
    }

    function setStateMessage(componentJSON, type) {
        dashboardUtils.getStateMessage(type).then(overLayConfig => {
            var responseObj = {};
            responseObj.errorText = overLayConfig.message;
            responseObj.showError = true;
            responseObj.isLoading = false;
            api.setState(componentJSON, responseObj);
        });
    }

    function applyDateChanges(dateFilter) {
        var parentDateFilter = {
            start: dateFilter.start,
            end: dateFilter.end,
            dynamicTimeRange: dateFilter.dynamicTimeRange
        };
        api.setState("highlightsDateJSON", parentDateFilter);
        var responseObj = {};
        helpers.snHttp('api/snc/notification_dashboard/notifications/email/category', {
            method: 'POST',
            batch: false,
            body: {
                startDate: parentDateFilter.start,
                endDate: parentDateFilter.end,
                totalRecords: 1
            }
        }).then(({
            response
        }) => {
            if (response.result == undefined || response.result.length == 0) {
                setStateMessage("mostUsedCategoryJSON", "zero_results");
            } else {
                var responseObj = {};
                responseObj.showError = false;
                Object.assign(responseObj, response.result[0]);
                responseObj.isLoading = false;
                api.setState("mostUsedCategoryJSON", responseObj);
            }
        }).catch(({
            error
        }) => {
            console.error("error while fetching the content");
            setStateMessage("mostUsedCategoryJSON", "error");
        });
        helpers.snHttp('api/snc/notification_dashboard/notifications/email/top', {
            method: 'POST',
            batch: false,
            body: {
                startDate: parentDateFilter.start,
                endDate: parentDateFilter.end,
                totalRecords: 1
            }
        }).then(({
            response
        }) => {
            if (response.result == undefined || response.result.length == 0) {
                setStateMessage("mostTriggeredNotificationJSON", "zero_results");
            } else {
                    var triggeredResponseObj = {};
                triggeredResponseObj.showError = false;
                Object.assign(triggeredResponseObj, response.result[0]);
            triggeredResponseObj.isLoading = false;
            api.setState("mostTriggeredNotificationJSON", triggeredResponseObj);
            }
        }).catch(({
            error
        }) => {
            console.error("error while fetching the content");
            setStateMessage("mostTriggeredNotificationJSON", "error");
        });
        helpers.snHttp('api/snc/notification_dashboard/notifications/email/unusedcount', {
            method: 'POST',
            batch: false,
            body: {
                startDate: parentDateFilter.start,
                endDate: parentDateFilter.end
            }
        }).then(({
            response
        }) => {
            if (response.result == undefined || response.result.length == 0) {
                setStateMessage("unusedNotificationsJSON", "zero_results");
            } else {
                    var unusedResponseObj = {};
                unusedResponseObj.showError = false;
                Object.assign(unusedResponseObj, response.result);
            unusedResponseObj.isLoading = false;
            api.setState("unusedNotificationsJSON", unusedResponseObj);
            }
        }).catch(({
            error
        }) => {
            console.error("error while fetching the content");
            setStateMessage("unusedNotificationsJSON", "error");
        });
        helpers.snHttp('api/snc/notification_dashboard/notification/email/top_optedout', {
            method: 'POST',
            batch: false,
            body: {
                startDate: parentDateFilter.start,
                endDate: parentDateFilter.end,
                totalRecords: 1
            }
        }).then(({
            response
        }) => {
            if (response.result == undefined || response.result.length == 0) {
                setStateMessage("mostOptedOutNotificationJSON", "zero_results");
            } else {
                    var optedOutResponseObj = {};
                optedOutResponseObj.showError = false;
                Object.assign(optedOutResponseObj, response.result[0]);
            optedOutResponseObj.isLoading = false;
            api.setState("mostOptedOutNotificationJSON", optedOutResponseObj);
            }
        }).catch(({
            error
        }) => {
            console.error("error while fetching the content");
            setStateMessage("mostOptedOutNotificationJSON", "error");
        });
    }

}
