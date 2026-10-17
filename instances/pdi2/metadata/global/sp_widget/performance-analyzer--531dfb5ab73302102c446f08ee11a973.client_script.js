api.controller = function($scope, $timeout, $window, $sce, $http, spPerformanceAnalyzer, spUtil, snAnalytics, $q) {
    /* widget controller */
    var c = this;

    c.isPerfTabActiveAndOpen = isAnyActivePerformanceTabOpened();

    c.cancelAndOpenNew = function() {
        turnOffDebug().then(function() {
            clearStorageItems(true);
            var allKeys = Object.keys(localStorage);
            var prefix = 'sp_performance_tab_opened';

            _.forEach(allKeys, function(key) {
                if (_.startsWith(key, prefix)) {
                    localStorage.removeItem(key);
                }
            });
            window.location.reload();
        });
    }

    function isAnyActivePerformanceTabOpened(excludeCurrentTab) {
        var allKeys = Object.keys(localStorage);
        var prefix = 'sp_performance_tab_opened';

        var matchingKeys = _.filter(allKeys, function(key) {
            if (excludeCurrentTab && key == 'sp_performance_tab_opened_' + c.tabKey)
                return false;
            return _.startsWith(key, prefix);
        });
        return matchingKeys.length && window.localStorage.getItem("sp_perf_analyzer_summary_generated") != "true";
    }

    c.spDesignerOpened = window.g_spd || NOW.portal_id == "db57a91047001200ba13a5554ee49050";

    if (!c.spDesignerOpened && c.isPerfTabActiveAndOpen)
        return;

    var spWidgetLogs = [];
    var slowBusinessRules = [];
    var slowDBQuery = [];
    var slowACLs = [];
    var errors = [];
    var businessRuleStackMap = {};
    var ajaxApiLogs = [];
    var spWidgetsApiEndpoints = [];
    var excludeApiPoints = ["api/now/sp/rectangle/719150fab77342102c446f08ee11a94f",
        "api/now/js/debugger/log/start",
        "api/now/js/debugger/log/toggleDebugTypes"
    ]
    $scope.selectedTab = 0;

    c.loadDuration = 1000;
    c.aclDuration = 100;
    c.dbDuration = 100;
    c.brDuration = 100;
    c.ajaxProcessingDuration = 500;
    c.ajaxWaitingTime = 30;
    c.tabKey = generateUniqueTabKey();
	
    function  generateUniqueTabKey() {
        var timestamp = Date.now(); // Get current timestamp in milliseconds
        var randomNum = Math.floor(Math.random() * 1000000); // Generate a random number up to 1,000,000
        return timestamp + '_' + randomNum; // Concatenate with a prefix for clarity
    }

    $scope.fieldsValidation = false;

    $scope.iframeSrc = '';

    c.pageUrl = getPageUrl();
    $scope.canAccessPerfPageAndLogs = c.data.canAccessPerfPageAndLogs;

    $scope.setTab = function(tab) {
        $scope.selectedTab = tab;
    };

    $scope.openPreview = function() {
        $scope.selectedTab = 1;
    }

    $scope.reloadPage = function() {
        window.location.reload();
    };

    function getPageUrl() {
        var urlParams = $window.location.href.split('url_params=', 2)[1];
        return urlParams ? decodeURIComponent(urlParams) : "";
    }
    if (!c.spDesignerOpened && !c.data.cannotAccessPerfPage)
        init();

    function init() {
        var payload = {};
        payload.name = "PerfAnalyzerLoad";
        payload.data = {};
        payload.data["pageUrl"] = c.pageUrl;
        payload.data["canAccessPerfPageAndLogs"] = $scope.canAccessPerfPageAndLogs;
        snAnalytics.addEvent(payload);
        window.localStorage.setItem("sp_performance_tab_opened_" + c.tabKey, true);
    }

    function cancelCurrentTab(){
        localStorage.removeItem('sp_performance_tab_opened_' + c.tabKey);
        window.location.reload();
    }

    function afterFieldsValidation() {
        if (c.spDesignerOpened)
            return;
        $scope.status = c.data.i18nMessages.subscribingSessionMssg;
        $scope.fieldsValidation = true;

        c.loadThresholdDuration = _.isFinite(parseInt(c.loadDuration, 10)) ? parseInt(c.loadDuration, 10) : 1000;
        c.aclThresholdDuration = _.isFinite(parseInt(c.aclDuration, 10)) ? parseInt(c.aclDuration, 10) : 100;
        c.dbThresholdDuration = _.isFinite(parseInt(c.dbDuration, 10)) ? parseInt(c.dbDuration, 10) : 100;
        c.brThresholdDuration = _.isFinite(parseInt(c.brDuration, 10)) ? parseInt(c.brDuration, 10) : 100;
        c.ajaxProcessingThresholdDuration = _.isFinite(parseInt(c.ajaxProcessingDuration, 10)) ? parseInt(c.ajaxProcessingDuration, 10) : 500;
        c.ajaxWaitingTime = _.isFinite(parseInt(c.ajaxWaitingTime, 10)) ? parseInt(c.ajaxWaitingTime, 10) : 30;

        window.localStorage.setItem('sp_perf_analyzer_load_time_threshold', c.loadThresholdDuration);
        window.localStorage.setItem('sp_perf_analyzer_validate_triggered', true);

        sendAnalyticsOnPerfAnalyzerRun();
        $window.addEventListener('message', handleIframeData, false);

        if (!$scope.canAccessPerfPageAndLogs) {
            loadIframe();
            return;
        }
        /*
            Step 1: Set the is_analyzer_triggered property to true in the user session
            Step 2: Subscribe to session logs
            Step 3: Reload the iframe
        */

        initializeLogSubscriber().then(function() {
            return c.server.get({
                action: "performance_analyzer_triggered",
                value: true
            })
        }).then(function() {
            return subscribeToSessionLogs();
        }).then(function() {
            console.log("Successfully subscribed to session logs.");
            loadIframe();
        }).catch(function(error) {
            console.error("Failed to subscribe to session logs: ", error);
        });
    }

    function sendAnalyticsOnPerfAnalyzerRun() {
        var payload = {};
        payload.name = "PerfAnalyzerRun";
        payload.data = {};
        payload.data["pageUrl"] = c.pageUrl;
        payload.data["canAccessPerfPageAndLogs"] = $scope.canAccessPerfPageAndLogs;
        payload.data["loadThreshold"] = c.loadThresholdDuration;
        payload.data["aclThreshold"] = c.aclThresholdDuration;
        payload.data["dbThreshold"] = c.dbThresholdDuration;
        payload.data["brThreshold"] = c.brThresholdDuration;
        payload.data["ajaxProcessingThreshold"] = c.ajaxProcessingThresholdDuration;
        payload.data["ajaxWaitingTime"] = c.ajaxWaitingTime;
        snAnalytics.addEvent(payload);
    }

    //Reloads the page when all active performance tabs are deactivated, and the performance summary has not been generated.
    window.addEventListener('storage', function(event) {
        if (event.key == 'sp_performance_tab_opened_' + c.tabKey && event.oldValue !== null && event.newValue === null && $scope.slowWidgetsFetched != true)
            window.location.reload();
    });

    function isInvalidField(str, minValue) {
        var num = _.toNumber(str);
        var minThreshold = minValue || 0;
        return !(_.isFinite(num) && num >= minThreshold && String(num) == str);
    }

    function isInvalidURL(str) {
        try {
            var parsedUrl = new URL(str);
            var currentDomain = window.location.hostname;
            var urlDomain = parsedUrl.hostname;
            return currentDomain != urlDomain;
        } catch (error) {
            return false;
        }
    }

    $scope.validateFields = function() {
        if (isAnyActivePerformanceTabOpened(true)) {
            cancelCurrentTab();
            return;
        }
        if (c.spDesignerOpened)
            return;
        c.isInvalidUrl = isInvalidURL(c.pageUrl);
        c.isInvalidLoadTime = !_.isEmpty(c.loadDuration) && isInvalidField(c.loadDuration);
        c.isInvalidAclDuration = !_.isEmpty(c.aclDuration) && isInvalidField(c.aclDuration);
        c.isInvalidDbDuration = !_.isEmpty(c.dbDuration) && isInvalidField(c.dbDuration);
        c.isInvalidBrDuration = !_.isEmpty(c.brDuration) && isInvalidField(c.brDuration, 90);
        c.isInvalidAjaxProcessingDuration = !_.isEmpty(c.ajaxProcessingDuration) && isInvalidField(c.ajaxProcessingDuration);
        c.isInvalidAjaxWaitingDuration = !_.isEmpty(c.ajaxWaitingTime) && isInvalidField(c.ajaxWaitingTime, 30);
        if (c.isInvalidUrl || c.isInvalidLoadTime || c.isInvalidAclDuration || c.isInvalidDbDuration || c.isInvalidBrDuration || c.isInvalidAjaxProcessingDuration || c.isInvalidAjaxWaitingDuration)
            return;

        afterFieldsValidation();
    }

    function sendPerfAnalyerData(performanceAnalyzerData) {
        var iframe = document.getElementById('performance_preview');
        var targetOrigin = window.location.origin;
        var perfData = {
            type: 'PERF_DATA',
            canAccessPerfPageAndLogs: $scope.canAccessPerfPageAndLogs
        };
        if ($scope.canAccessPerfPageAndLogs)
            perfData.data = performanceAnalyzerData;
    
        iframe.contentWindow.postMessage(perfData, targetOrigin);
    }

    function loadIframe() {
        $scope.status = c.data.i18nMessages.reloadingPageMssg;
        $scope.iframeSrc = $sce.trustAsResourceUrl(c.pageUrl);
    }

    function clearStorageItems(isClearAll) {
        window.localStorage.removeItem('sp_perf_analyzer_load_time_threshold');
        window.localStorage.removeItem('sp_perf_analyzer_validate_triggered');

        if (isClearAll) {
            window.localStorage.removeItem("sp_performance_tab_opened_" + c.tabKey);
            window.localStorage.removeItem("sp_perf_analyzer_summary_generated");
        }
    }

    $window.onbeforeunload = function() {
        onTabClose();
    };

    function onTabClose() {
        clearStorageItems(true);
        if (c.data.canAccessPerfPageAndLogs) {
            turnOffDebug();
            removeSessionProperty();
        }
    }

    $scope.handlePlayIconClick = function(slowObj, index, table) {
        if (index == $scope.index && table == $scope.table)
            return;
        $scope.index = index;
        $scope.table = table;
        var data = {
            slowObj: slowObj,
            isRequestFromPerfList: true,
            showAjaxObjSummary: table == 'ajaxList'
        }
        spUtil.get("widget-performance-stats", data).then(function(response) {
            $timeout(function() {
                c.data.widgetSummary = response;
            })
        });

    }

    function removeSessionProperty() {
        c.server.get({
            action: "performance_analyzer_triggered",
            value: false
        })
    }

    function processData() {
        // Use $timeout to ensure AngularJS applies the status to UI
        $timeout(function() {
            $scope.status = c.data.i18nMessages.analyzingPageLogsMsg;
        });

        $timeout(function() {
            if (!$scope.canAccessPerfPageAndLogs) {
                sendPerfAnalyerData();
                return;
            }
            var performanceAnalyzerData = {
                "acls": slowACLs,
                "businessRules": slowBusinessRules,
                "dbCalls": slowDBQuery,
                "errors": errors
            };
            var spWidgetLogsByApi = groupByApi(spWidgetLogs);
            var slowAclsByApi = groupByApi(slowACLs);
            var slowBusinessRulesByApi = groupByApi(slowBusinessRules);
            var slowDBQueryByApi = groupByApi(slowDBQuery);
            var errorsByApi = groupByApi(errors);
            var spWidgets = processWidgetLogs(spWidgetLogsByApi);

            mergeItemsToWidgetsByApi(spWidgets, slowAclsByApi, "acls");
            mergeItemsToWidgetsByApi(spWidgets, slowBusinessRulesByApi, "businessRules");
            mergeItemsToWidgetsByApi(spWidgets, slowDBQueryByApi, "dbCalls");
            mergeItemsToWidgetsByApi(spWidgets, errorsByApi, "errors");
            spWidgets = flattenSpWidgetsArrays(spWidgets);
            groupAndFilterACLs(spWidgets);
            spWidgets = spPerformanceAnalyzer.mergeDuplicatesWidgetData(spWidgets);
            performanceAnalyzerData.spWidgetsLogs = spWidgets;
            sendPerfAnalyerData(performanceAnalyzerData);
            c.ajaxApiLogSummary = generateAjaxApiLogSummary(slowAclsByApi, slowBusinessRulesByApi, slowDBQueryByApi, errorsByApi);
            turnOffDebug();
        }, c.ajaxWaitingTime * 1000);
    }

    function mapItemsToAjaxApi(ajaxApis, slowAclsByApi, slowBusinessRulesByApi, slowDBQueryByApi, errorsByApi) {
        return _.map(ajaxApis, function(ajaxApi) {
            var tPage = ajaxApi.tPage;
            var matchingAcls = _.get(slowAclsByApi, tPage, []);
            var matchingBrs = _.get(slowBusinessRulesByApi, tPage, []);
            var matchingDBCalls = _.get(slowDBQueryByApi, tPage, []);
            var matchingErrors = _.get(errorsByApi, tPage, []);
            return _.assign({}, ajaxApi, {
                acls: matchingAcls,
                businessRules: matchingBrs,
                dbCalls: matchingDBCalls,
                errors: matchingErrors
            });
        });
    }

    function generateAjaxApiLogSummary(slowAclsByApi, slowBusinessRulesByApi, slowDBQueryByApi, errorsByApi) {
        var logs = convertTimeKeysToMilliseconds(ajaxApiLogs);
        var uniqueAjaxApiLog = mergedDuplicatesAjaxApiLog(logs);
        var filteredLogs = _.filter(uniqueAjaxApiLog, function(log) {
            return !_.includes(spWidgetsApiEndpoints, log.tPage);
        });
        var ajaxApiLogsWithComponentdata = mapItemsToAjaxApi(filteredLogs, slowAclsByApi, slowBusinessRulesByApi, slowDBQueryByApi, errorsByApi);
        groupAjaxApiComponentsAndFilterAcls(ajaxApiLogsWithComponentdata);
        return filterAjaxLogBasedOnProcessingThreshold(ajaxApiLogsWithComponentdata);
    }

    function filterAjaxLogBasedOnProcessingThreshold(ajaxApiLogsWithComponentdata) {
        return _.filter(ajaxApiLogsWithComponentdata, function(item) {
            return item["processing time"] >= c.ajaxProcessingThresholdDuration ||
                   item.acls.length > 0 ||
                   item.businessRules.length > 0 ||
                   item.dbCalls.length > 0 ||
                   item.errors.length > 0;
          });
    }

    function groupAjaxApiComponentsAndFilterAcls(ajaxApiLogsWithComponentdata) {
        _.forEach(ajaxApiLogsWithComponentdata, function(item) {
            if (!_.isEmpty(item.businessRules))
                item.businessRules = spPerformanceAnalyzer.groupByBusinessRules(item.businessRules);

            if (!_.isEmpty(item.dbCalls))
                item.dbCalls = spPerformanceAnalyzer.groupByDbCalls(item.dbCalls);

            if (!_.isEmpty(item.acls))
                item.acls = filterACLByThreshold(item.acls)
        })
    }

    function convertTimeKeysToMilliseconds(logs) {
        return _.map(logs, function(log) {
            _.forEach(log, function(value, key) {
                // Regular expression to match time in the format "0:00:00.000"
                if (typeof value === 'string' && key != "message" && /^\d+:\d{2}:\d{2}\.\d{3}/.test(value)) {
                    // Extract time value and count part
                    var parts = value.split(' (count');
                    var timeValue = parts[0].trim(); // Get time portion

                    // Convert the time portion to milliseconds
                    log[key] = timeToMilliseconds(timeValue);
                }
            });
            return log;
        });
    }

    function mergedDuplicatesAjaxApiLog(logs) {
        var groupedLogs = _.groupBy(logs, 'tPage');
        return _.map(groupedLogs, function(group) {
            var mergedLog = _.clone(group[0]);
            var totalProcessingTime = _.reduce(group, function(sum, currentLog) {
                return sum + currentLog['processing time'];
            }, 0);
            mergedLog['processing time'] = totalProcessingTime;
            return mergedLog;
        });
    }

    function groupAndFilterACLs(spWidgets) {
        spWidgets.forEach(function(spWidget) {
            spWidget.acls = filterACLByThreshold(spWidget.acls)
        });
    }

    function filterACLByThreshold(acls) {
        if (!_.isArray(acls) || _.isEmpty(acls))
            return;
        var thresholdAcls = groupByAcls(acls);
        thresholdAcls = _.filter(thresholdAcls, function(acl) {
            return acl.duration >= c.aclThresholdDuration;
        });
        return thresholdAcls;
    }

    function groupByAcls(input) {
        return _.chain(input)
            .groupBy('name')
            .map(function(value, key) {
                var totalDuration = _.sumBy(value, 'duration');
                return {
                    name: key,
                    count: value.length,
                    items: value,
                    link: value[0].link,
                    duration: totalDuration,
                    tPage: value[0].tPage
                };
            }).value();
    }

    function flattenSpWidgetsArrays(spWidgets) {
        // Extract all values (arrays) from the object
        var spWidgetsArray = _.values(spWidgets);

        // Concatenate all arrays into one
        return _.flatten(spWidgetsArray);
    }

    /**
     * Merges logs into corresponding widgets or page logs by API.
     *
     * This function iterates over a collection of `items` (logs), and for each log group (key),
     * it determines whether the logs originate from a widget-specific(sp/page or widget rectangle) API call or a general page API call.
     * If the logs correspond to a widget, the `mergeItemsToWidgets` function is used to merge them into the widget.
     */
    function mergeItemsToWidgetsByApi(spWidgets, items, logType) {
        _.forEach(items, function(logs, key) {
            if (!_.isEmpty(spWidgets[key])) {
                mergeItemsToWidgets(spWidgets[key], logs, logType);
                if (!_.includes(spWidgetsApiEndpoints, key))
                    spWidgetsApiEndpoints.push(key);
            }
        })
    }

    function groupByApi(items) {
        return _.groupBy(items, "tPage")
    }

    function handleIframeData(event) {
        if (event.origin !== window.location.origin) {
            return;
        }
        switch (event.data.type) {
            case 'IFRAME_SLOW_WIDGET_SUMMARY': {
                getSlowWidgetsSummary(event.data.data);
                break;
            }
            case 'PAGE_LOAD_STATUS': {
                if (event.data.data.sp_page_load == true);
                processData();
                break;
            }
        }
    }

    function getSlowWidgetsSummary(item) {
        window.localStorage.setItem('sp_perf_analyzer_summary_generated', true);
        c.slowWidgetsSummary = item.slowWidgets;
        c.totalWidgetsOnPageCount = item.totalWidgetsOnPageCount;
        c.isslowWidgetsListEmpty = _.isEmpty(c.slowWidgetsSummary);
        c.isAjaxApiListEmpty = _.isEmpty(c.ajaxApiLogSummary);
        c.slowWidgetComponentSummary = fetchSlowWidgetComponentSummary(c.slowWidgetsSummary);
        c.ajaxApiComponentSummary = fetchSlowWidgetComponentSummary(c.ajaxApiLogSummary);
        clearStorageItems(false);
        $timeout(function() {
            $scope.slowWidgetsFetched = true;
        });
    }

    function fetchSlowWidgetComponentSummary(slowWidgets) {
        var counts = {
            aclsCount: 0,
            dbCallsCount: 0,
            businessRulesCount: 0,
            errorsCount: 0
        };
        _.forEach(slowWidgets, function(item) {
            counts.aclsCount += _.isArray(item.acls) ? item.acls.length : 0;
            counts.dbCallsCount += _.isArray(item.dbCalls) ? item.dbCalls.length : 0;
            counts.businessRulesCount += _.isArray(item.businessRules) ? item.businessRules.length : 0;
            counts.errorsCount += _.isArray(item.errors) ? item.errors.length : 0;
        });

        return counts;
    }

    function turnOffDebug() {
        var turnOff = {
            "sql_detailed": false,
            "security_rules": false,
            "db-category": false,
            "security": false,
            "sql-detail": false,
            "security_grant": false,
            "log": false,
            "business_rule": false,
            "top_script": true,
            "transaction": true,
            "sql": false,
            "security_refuse": true
        };

        return $http.post('/api/now/js/debugger/log/toggleDebugTypes', turnOff).then(function(response) {
            return stopDebugger();
        }, function(response) {
            logErrorMessage(response, "Failed to turn off debug types for Session Debugger: ");
            return $q.reject(response);
        });
    }

    function stopDebugger() {
       return $http.get('/api/now/js/debugger/log/stop').then(function(response) {
            if (response.data.result.state === "OFF")
                console.log("Session Debugger has been deactivated");
        }, function(response) {
            console.error(response, "Failed to deactivate Session Debugger: ");
            return $q.reject(response);
        });
    }

    function filterWidgetLog(logMessage) {
        var regex = /Service Portal Widget processing(.*)/;
        var match = regex.exec(logMessage);
        return match ? match[1].trim() : null;
    }

    // Associate items with the correct widget based on their timestamp
    function mergeItemsToWidgets(spWidgetArrays, items, key) {
        if (_.isEmpty(spWidgetArrays) || _.isEmpty(items))
            return;

        var itemIndex = 0;
        // Process remaining items and assign them to the appropriate widgets
        for (var j = itemIndex; j < items.length; j++) {
            var item = items[j];
            var itemTime = item.time;

            for (var i = 0; i < spWidgetArrays.length; i++) {
                var widgetStartTime = spWidgetArrays[i].start;

                if (itemTime > widgetStartTime) {
                    // Continue if item time is greater than the widget start time
                    continue;
                } else if (itemTime == widgetStartTime) {
                    // If item time matches widget start time, add item to the current widget
                    if (!spWidgetArrays[i][key])
                        spWidgetArrays[i][key] = [];
                    spWidgetArrays[i][key].push(item);
                } else {
                    //if item's timestamp is less than widget's start time, item belongs to previous widget.
                    //Retrieve the previous widget and add the item to it.
                    var prevWidget = spWidgetArrays[i - 1];
                    if (prevWidget) {
                        if (!prevWidget[key])
                            prevWidget[key] = [];
                        prevWidget[key].push(item);
                        break;
                    }
                }
            }
        }
    }

    //Extracts widgetsysId and instanceId from widget log.
    //Add elementId, widgetSysId, and start/end time to object
    function extractWidgetInfo(log, parts, timeKey, newObj, parentInstanceId) {
        var spMessage = parts[1];
        var messageSplits = _.split(spMessage, ';');
        var widgetSysId, instanceId;
        if (messageSplits[0]) {
            // Extract and set the widget Sys ID
            widgetSysId = _.split(messageSplits[0], '=')[1];
            _.set(newObj, 'widgetSysId', widgetSysId);
        }
        if (messageSplits[1]) {
            // Extract and set the instance ID if present in the widget log
            instanceId = _.split(messageSplits[1], '=')[1];
            _.set(newObj, 'instanceId', instanceId);
            _.set(newObj, 'elementId', "x" + instanceId);
        } else if (!!parentInstanceId) {
            // If instance ID is missing, use the parent instance ID if available
            instanceId = parentInstanceId;
            _.set(newObj, 'instanceId', parentInstanceId);
            _.set(newObj, 'isEmbeddedWidget', true);
            _.set(newObj, 'elementId', "v" + parentInstanceId + widgetSysId);
        } else {
            // If neither instance ID nor parent instance ID is available,
            // assume it's an AJAX call or a header/footer element
            _.set(newObj, 'elementId', "v" + widgetSysId);
        }
        _.set(newObj, timeKey, _.get(log, 'time'));
        _.set(newObj, "tPage", _.get(log, 'tPage'));
    }

    // Merge widget logs into a single object, including start/end times, elementId, widgetSysId, and instanceId
    function processWidgetLogs(spWidgetLogs) {
        _.forEach(spWidgetLogs, function(logs, key) {
            spWidgetLogs[key] = processWidgetLogsByApi(logs);
        })
        return spWidgetLogs;
    }

    function processWidgetLogsByApi(spWidgetLogs) {
        var startLogPrefix = "Service Portal Widget processing starts for:";
        var endLogPrefix = "Service Portal Widget processing ends for:";
        var startLogRegex = new RegExp(startLogPrefix);
        var endLogRegex = new RegExp(endLogPrefix);
        var widgetLogStack = [];
        var processedWidgetLogs = [];
        var parentInstanceId;
        _.forEach(spWidgetLogs, function(log, index) {
            var logEntry = {};
            var logMessage = _.get(log, 'message', '');
            if (startLogRegex.test(logMessage)) {
                var parts = _.split(logMessage, startLogPrefix);
                if (parts[1]) {
                    extractWidgetInfo(log, parts, 'start', logEntry, parentInstanceId);
                    widgetLogStack.push(logEntry);
                    if (logEntry.instanceId)
                        parentInstanceId = logEntry.instanceId;
                }
            } else if (endLogRegex.test(logMessage)) {
                var parts = _.split(logMessage, endLogPrefix);
                if (parts[1]) {
                    extractWidgetInfo(log, parts, 'end', logEntry, parentInstanceId);
                    var stackEntry = widgetLogStack.pop();
                    if (stackEntry && logEntry && stackEntry.elementId == logEntry.elementId) {
                        stackEntry.end = logEntry.end;
                        processedWidgetLogs.push(stackEntry);
                    }
                    if (logEntry.instanceId == parentInstanceId && !logEntry.isEmbeddedWidget)
                        parentInstanceId = null;
                }
            }
        });
        return _.sortBy(processedWidgetLogs, 'start');
    }

    function catchErrors(log) {
        var params = log.params;
        if (!_.isEmpty(params))
            errors.push({
                time: params.time,
                message: log.message,
                tPage: log.transaction.tPage
            })
    }

    function catchSlowAcl(aclLog) {
        var params = aclLog.params;
        var duration = params.duration;

        if (!_.isEmpty(params) && duration) {
            var aclName = getAclName(aclLog.message);
            var link = getAclLink(aclLog.message);
            slowACLs.push({
                duration: duration,
                name: aclName,
                link: link,
                time: params.time,
                tPage: aclLog.transaction.tPage
            });
        }
    }

    function getAclName(message) {
        //Fetch string string between PATH = </span> & <span
        var regex = / PATH = <\/span>(.*?)<span/;
        var match = message.match(regex);
        if (match)
            return match[1].trim();
    }

    function getAclLink(message) {
        // Fetches href attribute value of anchor tag with the class "linked," and target attribute set to _blank.
        var regex = /<a\s(?=[^>]*href="([^"]+)")(?=[^>]*target="_blank")(?=[^>]*class="linked")[^>]*>/;
        var match = message.match(regex);
        if (match)
            return match[1].trim();
    }

    function catchSlowDBQuery(sqlLog) {
        var params = sqlLog.params;
        var duration = params.duration;
        var tableName = params["sql_from_table"][params["sql_from_table"].length - 1];
        params["tPage"] = sqlLog.transaction.tPage;

        if (duration >= c.dbThresholdDuration && !_.isEmpty(tableName))
            slowDBQuery.push(params);
    }

    // Catch widget execution start & end logs
    function catchWidgetsLogs(state) {
        var message = state.message;
        if (filterWidgetLog(state.message))
            spWidgetLogs.push({
                "message": state.message,
                "time": state.params.time,
                "tPage": state.transaction.tPage
            });
        else if (isApiPerfLog(message)) {
            processApiPerfLog(state);
        }
    }

    function processApiPerfLog(state) {
        // (\b[\w\s]+) - Matches the key (words with spaces).
        // :\s* - Matches the colon and optional spaces after the key.
        // (\d{1,2}:\d{2}:\d{2}\.\d{3}) - Captures the time in format hh:mm:ss.mmm.
        // (?:\s*\(count:\s*(\d+)\))? - Optionally matches and captures the count (if present) in the format (count: X).
        var regex = /(\b[\w\s]+):\s*(\d{1,2}:\d{2}:\d{2}\.\d{3})(?:\s*\(count:\s*(\d+)\))?/g;
        var match;
        var message = state.message;
        var output = {}
        var key, value;
        while ((match = regex.exec(message)) !== null) {
            key = match[1];
            value = match[2];
            value = value + (match[3] ? ' (count: ' + match[3] + ')' : ''); // If count exists, append it
            output[key] = value;
        }
        output.tPage = state.transaction.tPage
        output.message = message;
        ajaxApiLogs.push(output);
    }

    function isApiPerfLog(str) {
        // This regex checks if the string contains all the substrings:
        // total time, processing time, CPU time.
        var regex = /(?=.*End)(?=.*total time)(?=.*processing time)(?=.*CPU time)/;
        return regex.test(str);
    }

    function catchSlowBusinessRule(businessRuleLog) {
        var params = businessRuleLog.params;
        var time = params.time;
        var tPage = businessRuleLog.transaction.tPage;
        var brStack = businessRuleStackMap[tPage] || [];

        if (typeof time === 'string') {
            var duration = timeToMilliseconds(time);

            if (duration >= c.brThresholdDuration) {
                brStack.push({
                    name: params.name,
                    table: params.table,
                    duration: duration,
                    tPage: tPage,
                    link: getBrLink(businessRuleLog.message)
                });
                businessRuleStackMap[tPage] = brStack;
            }
        } else if (Number.isInteger(time) && /Finished executing/.test(businessRuleLog.message) && brStack.length) {
            var brEntry = brStack[brStack.length - 1];

            if (params.table == brEntry.table) {
                brEntry.time = time;
                slowBusinessRules.push(brStack.pop());
            }
        }
    }

    function getBrLink(message) {
        var regex = /href\s*=\s*['"]?([^'"\s>]+)['"]?/;
        var match = message.match(regex);
        if (match)
            return match[1].trim();
    }


    function timeToMilliseconds(time) {
        // Split the input time into minutes and seconds
        time = time.replace(/:/g, '.')
        var parts = time.split('.');
        var length = parts.length;

        var minutes = 0;
        var seconds = 0;
        var milliseconds = 0;
        var hours = 0;
        if (parts.length === 4) {

            hours = parseInt(parts[length - 4], 10);
            minutes = parseInt(parts[length - 3], 10);
            seconds = parseInt(parts[length - 2], 10);
            milliseconds = parseInt(parts[length - 1], 10);
        }
        // If the input time has two parts (minutes and seconds and  milliseconds)
        else if (parts.length === 3) {
            minutes = parseInt(parts[length - 3], 10);
            seconds = parseInt(parts[length - 2], 10);
            milliseconds = parseInt(parts[length - 1], 10);
        }
        // If the input time has one part (seconds and milliseconds)
        else if (parts.length === 2) {
            seconds = parseInt(parts[length - 2], 10);
            milliseconds = parseInt(parts[length - 1], 10);
        }

        // Calculate the total time in milliseconds
        var totalMilliseconds = (hours * 60 * 60 * 1000) + (minutes * 60 * 1000) + (seconds * 1000) + milliseconds;

        return totalMilliseconds;
    }

    function subscribeToSessionLogs() {
        return new Promise(function(resolve, reject) {
            getGlobalAmbClient()
                .then(function(ambClient) {
                    var ambchannel = ambClient.getChannel("/debugger/sessionlog/" + c.data.g_sessionId);
                    ambchannel.subscribe(function(response) {
                        var states = [];
                        if (response && response.data && response.data.states) {
                            states = response.data.states;
                        }
                        states.forEach(function(state) {
                            var tPage = state.transaction && state.transaction.tPage;
                            if (_.includes(excludeApiPoints, tPage))
                                return;

                            if (state.level == "ERROR")
                                catchErrors(state);
                            if (state.type == "log")
                                catchWidgetsLogs(state);
                            else if (state.type == "business_rule")
                                catchSlowBusinessRule(state);
                            else if (state.type == "sql")
                                catchSlowDBQuery(state);
                            else if (state.type == "security_grant")
                                catchSlowAcl(state);
                        })
                    });
                    // Resolve promise after subscription setup is complete
                    resolve();
                }).catch(function(error) {
                    reject(error);
                });
        })
    }
    // Set Business rul, logs, sql queries & ACLs as true for debugger 
    function setDebugTypes() {
        var debugTypes = {
            "business_rule": true,
            "sql": true,
            "log": true,
            "security": true
        };
        return $http.post('/api/now/js/debugger/log/toggleDebugTypes', debugTypes).then(function(response) {
            console.log("Session Debugger has been initialized successfully.");
        }, function(response) {
            logErrorMessage(response, "Failed to set debug types for Session Debugger: ");
            return $q.reject(response);
        });

    }

    //Initializes log subscriber by making an API call to start logging for the debugger.
    function initializeLogSubscriber() {
        return $http.get('/api/now/js/debugger/log/start').then(function(response) {
            if (response.data.result.state === "ON")
                return setDebugTypes();
            return $q.reject(response);
        }, function(response) {
            logErrorMessage(response, "Failed to start the debugger log: ");
            return $q.reject(response);
        });
    }

    function logErrorMessage(response, errorPrefix) {
        response = JSON.parse(response.responseText);
        var status = response.status;
        if (status == "failure") {
            var error = response.error;
            console.error(errorPrefix + error.message + " " + error.detail);
        }
    }
    //Returns promise that resolves with global `g_ambClient` object if it is available and its connection state is 'opened'
    function getGlobalAmbClient() {
        return new Promise(
            function(resolve, reject) {
                if (typeof window === "object") {
                    var counter = 0,
                        maxTry = 10;
                    var ambcTries = setInterval(function() {
                        counter++;
                        if (window.g_ambClient && typeof window.g_ambClient === "object") {
                            if (window.g_ambClient.getConnectionState() === 'opened') {
                                clearInterval(ambcTries);
                                resolve(window.g_ambClient);
                            }
                        } else if (counter >= maxTry) {
                            clearInterval(ambcTries);
                            reject("ambClient not found or not connected");
                        }
                    }, 100);
                } else {
                    reject("no window object for ambClient");
                }
            }
        );
    }
};
