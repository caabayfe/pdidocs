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
    const mergePARFiltersV2 = imports["global.mergePARFilters"]().v2;
    const dashboardUtils = imports["sn_notif_dashboard.NotificationDashboardUtils"](helpers);
    switch (event.name) {
        case "MACROPONENT_PROPERTY_CHANGED":
            if (!api.state.isFirstBackendCall) {
                api.setState("debounceTimeoutId", ({
                    currentValue
                }) => {
                    let timeoutId = currentValue || null;
                    if (timeoutId) {
                        helpers.timing.clearTimeout(timeoutId);
                    }
                    timeoutId = helpers.timing.setTimeout(() => {
                        api.setState('debounceTimeoutId', null);
                        syncWithPageParameters();
                    }, 300);
                    return timeoutId;
                });
            }
            break;
        case "SN_COMPONENT_FILTER#APPLIED_ITEMS":
            const updatedDateFilter = getDateFilter(appliedFilters);
            if (updatedDateFilter && !updatedDateFilter.start)
                return;
            var dateFilter = getDateFilter(appliedFilters);
            if (api.state.isFirstBackendCall&& dateFilter) {
                api.setState("defaultDateFilter", {...dateFilter});
            }
            handleDateFilterChanges(appliedFilters);
            break;
    }

    function handleDateFilterChanges(appliedFilters) {
        var filter = {
            "order": 9000,
            "filterId": "1i97890en2ihadp4fli",
            "type": "choice",
            "label": "",
            "source": {
                "payload": {
                    "breakdown": "4a520a4cff6c5a10ac42fbd38c4fd997",
                    "factsTable": "sysevent_email_action",
                    "field": "sys_id",
                    "isChoiceType": false,
                    "targetTable": "sysevent_email_action"
                },
                "type": "indicator"
            },
            "values": [api.context.props.notifID],
            "include_unmatched_or_empty": false,
            "apply_to": [{
                "type": "pa",
                "key": "4a520a4cff6c5a10ac42fbd38c4fd997"
            }]
        };
        appliedFilters.push(filter);
        api.setState("parFilters", ({
            currentValue,
            api
        }) => {
            const {
                parFilters,
                encodedQueries
            } = mergePARFiltersV2(currentValue, appliedFilters);
            api.setState("encodedQueries", encodedQueries);
            var isDateFilter = (appliedFilters || []).find(function(filter) {
                return  filter.filterId == '1i7l1fqb5n2adeht5q1';
               // return filter.type == "date";
            });
            if (isDateFilter) {
                if (!api.state.isFirstBackendCall) {
                    var dateFilter = getDateFilter(parFilters);
                    api.setState("dateJSON", dateFilter);
                    handleDateFilter(dateFilter, api.state.notificationID);
                    evaluateUnsubscribeCount(dateFilter, api.state.notificationID);
                } else {
                    api.setState("isFirstBackendCall", false);
                    var pageParams = api.context.props;
                    if (pageParams.startDate && pageParams.endDate && pageParams.dynamicTimeRange) {
                        parFilters[0].start = pageParams.startDate;
                        parFilters[0].end = pageParams.endDate;
                        parFilters[0].dynamicTimeRange = pageParams.dynamicTimeRange;
                    }
                    helpers.timing.setTimeout(() => {
                        var pageParams = api.context.props;
                        var notificationID = api.context.props.notifID;
                        var url = '/sysevent_email_action.do?sys_id=' + notificationID + '&sysparm_view=advanced';
                        api.setState('notifLink', url);
                        var dateFilter = (appliedFilters || []).find(function(filter) {
                            return filter.type == "date";
                        });
                        api.setState('notificationID', notificationID);
                        if (dateFilter) {
                            //read the values from page parameters and update it
                            if (pageParams.startDate && pageParams.endDate && pageParams.dynamicTimeRange) {
                                dateFilter.start = pageParams.startDate;
                                dateFilter.end = pageParams.endDate;
                                dateFilter.dynamicTimeRange = pageParams.dynamicTimeRange;
                                api.setState("dateJSON", dateFilter);
                                handleDateFilter(dateFilter, notificationID);
                                evaluateUnsubscribeCount(dateFilter, notificationID);
                                return [dateFilter];
                            }
                        }
                    }, 1);
                }
            }
            return parFilters;
        });
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

    function syncWithPageParameters() {
        var pageProps = api.context.props;
        var dateFilter = api.state.parFilters.find(
            function(filter) {
                return filter.type == "date";
            }
        );
        if (dateFilter.start != pageProps.startDate || dateFilter.end != pageProps.endDate) {
            var newDateFilter = { ...dateFilter
            };
            newDateFilter.start = pageProps.startDate;
            newDateFilter.end = pageProps.endDate;
            newDateFilter.dynamicTimeRange = pageProps.dynamicTimeRange;

            var {
                parFilters
            } = mergePARFiltersV2(api.state.parFilters, [newDateFilter]);
            api.setState("parFilters", () => {
                handleDateFilterChanges([newDateFilter]);
                return parFilters;
            });
        }

    }

    function evaluateUnsubscribeCount(parFilters, notificationID) {
        helpers.snHttp('api/snc/notification_dashboard/notifications/email/unsubscribecount', {
            method: 'POST',
            batch: false,
            body: {
                startDate: parFilters.start,
                endDate: parFilters.end,
                notificationID: notificationID
            }
        }).then(({
            response
        }) => {

            if (response.result == undefined || response.result.length == 0) {
                setStateMessage("unsubscribeCountJSON", "zero_results");
            } else {
                const unsubscribeCount = response.result;
                var responseObj = {};
                responseObj.showError = false;
                Object.assign(responseObj, unsubscribeCount);
                responseObj.isLoading = false;
                api.setState("unsubscribeCountJSON", responseObj);
            }
        }).catch(({
            error
        }) => {
            console.error("error while fetching the content");
            setStateMessage("unsubscribeCountJSON", "error");
        });
    }

    function getDateFilter(parFilters) {
        return parFilters.find(filter => filter.filterId == "1i7l1fqb5n2adeht5q1");
    }

    function handleDateFilter(parFilters, notificationID) {
        var presentDuration = {
            startDate: parFilters.start,
            endDate: parFilters.end
        };
        var pastDuration = {};
        var now = new Date();
        var presentDate = now.getDate();
        var newdate = new Date(now.setMonth(now.getMonth() - 1));
        var prevMonth = newdate.toLocaleString('default', {
            month: 'long'
        }) + ', ' + newdate.getFullYear();
        if (parFilters.dynamicTimeRange == "SN_DYNAMIC_DATERANGE__LAST_WEEK") {
            api.setState("previousDurationTitle", prevMonth);
            var presentStartDate = new Date(parFilters.start);
            var presentEndDate = new Date(parFilters.end);
            var pastStartDate = new Date(presentStartDate.setDate(presentStartDate.getDate() - 7));
            var pastEndDate = new Date(presentEndDate.setDate(presentEndDate.getDate() - 7));
            pastDuration.startDate = pastStartDate.toISOString().split('T')[0];
            pastDuration.endDate = pastEndDate.toISOString().split('T')[0];
            prevMonth = pastStartDate.getDate() + ' ' + pastStartDate.toLocaleString('default', {
                month: 'short'
            }) + ' ' + pastStartDate.getFullYear() + ' - ' + pastEndDate.getDate() + ' ' + pastEndDate.toLocaleString('default', {
                month: 'short'
            }) + ' ' + pastEndDate.getFullYear();
            api.setState("previousDurationTitle", prevMonth);
        } else if (parFilters.dynamicTimeRange == "SN_DYNAMIC_DATERANGE__LAST_MONTH") {
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
        } else if (parFilters.dynamicTimeRange == "SN_DYNAMIC_DATERANGE__LAST_QUARTER" || parFilters.dynamicTimeRange == "SN_DYNAMIC_DATERANGE__LAST_3_MONTH") {
            var dateEnd = new Date(parFilters.start);
            var quarterEnd = new Date(dateEnd.setMonth(dateEnd.getMonth() - 1));
            var dateStart = new Date(parFilters.start);
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
        } else if (parFilters.dynamicTimeRange == "SN_DYNAMIC_DATERANGE__YESTERDAY") {
            api.setState("previousDurationTitle", prevMonth);
            var today = new Date(parFilters.start);
            var yesterday = new Date(today.setDate(today.getDate() - 1));
            pastDuration.startDate = yesterday.toISOString().split('T')[0];
            pastDuration.endDate = yesterday.toISOString().split('T')[0];
            prevMonth = yesterday.getDate() + ' ' + yesterday.toLocaleString('default', {
                month: 'short'
            }) + ' ' + yesterday.getFullYear();
            api.setState("previousDurationTitle", prevMonth);
        } else if (parFilters.dynamicTimeRange == "SN_DYNAMIC_DATERANGE__LAST_3_MONTH") {

        }
        api.setState("previousDurationJSON", pastDuration);
        helpers.snHttp('api/snc/notification_dashboard/notifications/email/triggerCountById', {
            method: 'POST',
            batch: false,
            body: {
                startDate: pastDuration.startDate,
                endDate: pastDuration.endDate,
                notificationID: notificationID
            }
        }).then(({
            response
        }) => {
            if (response.result == undefined || response.result.length == 0) {
                setStateMessage("triggerCountByIdJSON", "zero_results");
            } else {
                var responseObj = {};
                responseObj.showError = false;
                Object.assign(responseObj, response.result[0]);
                responseObj.isLoading = false;
                api.setState("triggerCountByIdJSON", responseObj);
            }
        }).catch(({
            error
        }) => {
            console.error("error while fetching the content");
            setStateMessage("triggerCountByIdJSON", "error");
        });

        helpers.snHttp('api/snc/notification_dashboard/notifications/email/optOutById', {
            method: 'POST',
            batch: false,
            body: {
                startDate: parFilters.start,
                endDate: parFilters.end,
                notificationID: notificationID
            }
        }).then(({
            response
        }) => {
            if (response.result == undefined || response.result.length == 0) {
                setStateMessage("optedOutInfo", "zero_results");
            } else {
                var responseObj = {};
                responseObj.showError = false;
                Object.assign(responseObj, response.result[0]);
                responseObj.isLoading = false;
                api.setState("optedOutInfo", responseObj);
            }
        }).catch(({
            error
        }) => {
            console.error("error while fetching the content");
            setStateMessage("optedOutInfo", "error");
        });

    }
}
