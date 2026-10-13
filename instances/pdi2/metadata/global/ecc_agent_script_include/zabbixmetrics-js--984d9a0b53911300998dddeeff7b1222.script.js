var ZabbixMetrics_JS = Class.create();

// MID
var HTTPRequest = Packages.com.glide.communications.HTTPRequest;
var MetricFactory = Packages.com.service_now.metric.MetricFactory;
var RawMetric = Packages.com.service_now.metric.model.RawMetric;
var HandleTypesProvider = Packages.com.service_now.metric.registration.HandleTypesProvider;
var SimpleDateFormat = Packages.java.text.SimpleDateFormat;
var StringUtil = Packages.com.glide.util.StringUtil;

// Constants
var SUCCESS = Packages.com.service_now.mid.probe.tpcon.OperationStatusType.SUCCESS;
var FAILURE = Packages.com.service_now.mid.probe.tpcon.OperationStatusType.FAILURE;
var SOURCE = "Zabbix";
var LAST_METRIC_TIME = 0;
var HIST_DATA_MAX_FETCH_INTERVAL_MINS = 180;

// Globals
var offsetMs = this.probe.getAdditionalParameter("offset_min") * 60000 || 300000;
var metricCounter = 0;
var errorMessage = "";
var isDebug = false;
var islogPayloadForDebug = false;
var isBatchProcessingEnabled = false;
var startDate = 0;
var endDate = 0;
var JSONparser = new JSON();
var AUTH_TOKEN = "";
var ZABBIX_VERSION = "";
var MAX_RETRY_COUNT = 3;

ZabbixMetrics_JS.prototype = Object.extendsObject(AProbe, {
    initialize: function(probe) {
        this.probe = probe;
    },

    /**
     * Function that the MID server uses to RUN the script for the metrics. Main logic lies here.
     * This is the code that the MID Server will run on each Iteration for the metrics.
     * @returns An Object with specific associated Script return values [status,last_kpi_signature,error]
     */
    retrieveKpi: function() {
        ms.log(SOURCE + ": Metrics execution");
        var startScriptTime = new Date();
        var retVal = {};
        var secondsSinceLastFetch;
        var isValidNumber;

        isDebug = "" + this.probe.getAdditionalParameter("debug");
        ms.log("isDebug: " + isDebug);

        islogPayloadForDebug = "" + this.probe.getAdditionalParameter("logPayloadForDebug");
        ms.log("islogPayloadForDebug: " + islogPayloadForDebug);
        var version = this.getZabbixVersion();
        if (!version) {
            retVal.status = FAILURE.toString();
            retVal['error_message'] = errorMessage;
            return retVal;
        }

        var authToken = this.getAuthToken();
        if (!authToken) {
            retVal.status = FAILURE.toString();
            retVal['error_message'] = errorMessage;
            return retVal;
        }

        var maxFetchIntervalMin = this.probe.getAdditionalParameter("max_fetch_interval_min");

        if (StringUtil.nil(maxFetchIntervalMin)) {
            secondsSinceLastFetch = HIST_DATA_MAX_FETCH_INTERVAL_MINS * 60;
            this.debug(SOURCE + ": max_fetch_interval_min is empty or missing! Please check the definition. We are setting it to " + HIST_DATA_MAX_FETCH_INTERVAL_MINS);
        } else {
            maxFetchIntervalMin = parseInt(maxFetchIntervalMin);
            isValidNumber = maxFetchIntervalMin > 0 ? true : false;

            if (isValidNumber) {
                secondsSinceLastFetch = maxFetchIntervalMin * 60;
            } else {
                secondsSinceLastFetch = HIST_DATA_MAX_FETCH_INTERVAL_MINS * 60;
                this.debug(SOURCE + ": max_fetch_interval_min is not valid! Please double check and enter minutes. We are setting it to " + HIST_DATA_MAX_FETCH_INTERVAL_MINS);
            }
        }

        LAST_METRIC_TIME = this.getLastMetricSignature(secondsSinceLastFetch);

        this.debug("LAST_METRIC_TIME: " + LAST_METRIC_TIME + "| " + this.formatDate(LAST_METRIC_TIME) +
            "\n" + "startDate: " + startDate);

        var hostids = [];
        var zabbixHosts = null;

        // When there are large number of hosts being monitored in zabbix, the metric data to be fetched from zabbix will be huge which affect the performance. 
        // It is also observed that when huge data is requested from zabbix api, the api breaks out with timeout error.
        // To handle such cases, batch processing should be enabled by setting the 'enable_batch_processing' connector insstance parameter to 'true'.
        // When batch processing is enabled, metrics details are fetched in batch with 1000 (can be altered by setting appropriate vallue to - 'max_hosts_per_batch' parameter) hosts per batch. 
        // The batch processing comes with cost of more number of network call to zabbix for fetching the details.
        // This should be enabled when data is huge that is causing performance issue and large number of hosts are being monitored on zabbix e.g. 10k or more. 
        isBatchProcessingEnabled = ('true' == String(this.probe.getAdditionalParameter("enable_batch_processing"))) ? true : false;
        var maxHostsInBatch = this.probe.getAdditionalParameter("max_hosts_per_batch") || 1000;
        this.debug("[isBatchProcessingEnabled=" + isBatchProcessingEnabled + ", maxHostsInBatch=" + maxHostsInBatch + "]");

        if (isBatchProcessingEnabled)
            zabbixHosts = this.getZabbixHosts();

        if (zabbixHosts) {

            this.debug("Total zabbix hosts - " + zabbixHosts.length);
            var hostCounter = 0;

            zabbixHosts.forEach(function(host) {

                if (hostids.indexOf(host.hostid) <= -1) {
                    hostCounter++;
                    hostids.push(host.hostid);
                }

                if (hostCounter == maxHostsInBatch) {
                    // collect metrics for batch of hosts
                    this.collectMetrics(hostids);

                    hostCounter = 0;
                    hostids = [];
                }
            }, this);
        }

        // collect metrics for last batch of hostids
        this.collectMetrics(hostids);

        this.authTokenSignOut();

        if (errorMessage.length > 0) {
            retVal["status"] = FAILURE.toString();
            retVal["error_message"] = errorMessage;
        } else {
            retVal["status"] = SUCCESS.toString();
        }

        retVal["last_kpi_signature"] = LAST_METRIC_TIME.toString();
        retVal['metric_source'] = "" + SOURCE;
        if (metricCounter > 0) {
            var totalDuration = Number((new Date().getTime() - startScriptTime.getTime()));
            var totalDurationSec = (totalDuration / 1000).toFixed(3);
            ms.log(SOURCE + ": MetricCollector handle total of " + metricCounter + " metrics in " + totalDurationSec + " seconds (" + Number(metricCounter / totalDurationSec).toFixed(3) + " per second)");
            retVal['metric_count'] = "" + metricCounter;
            retVal['metric_duration'] = "" + totalDuration;
        }

        return retVal;
    },

    getZabbixHosts: function() {
        var groupids = this.probe.getAdditionalParameter("groupids") || "false";
        var parameters = {
            "output": "hostid",
            "with_monitored_items": true
        };

        if (groupids != false && groupids != "false") {
            filteredGroupIds = this.getArrayOfStringsFromCsv(groupids.toString());
            parameters["filter"] = {
                "groupids": filteredGroupIds
            };
        }

        var body = this.createRequestBody("host.get", parameters, true);

        try {
            var response = this.createRequest(body);
            if (response.getStatusCode() == 200) {
                var resBody = this.parseJSON(response);
                var hosts = resBody.result;
                return hosts;
            } else {
                this.addError(response.getErrorMessage());
            }
        } catch (e) {
            this.addError(e.toString());
        }
        return [];
    },

    collectMetrics: function(hostids) {

        var sourceInstance = "" + this.probe.getParameter("connector_name");

        var zabbixItemsFloat = this.getZabbixItems(0, hostids);
        var zabbixItemsIntegerUnsigned = this.getZabbixItems(3, hostids);
        var itemHistoryFloat = this.getItemsHistory(zabbixItemsFloat, 0);
        var itemHistoryIntegerUnsigned = this.getItemsHistory(zabbixItemsIntegerUnsigned, 3);

        zabbixItemsFloat.forEach(function(item) {
            if (itemHistoryFloat.hasOwnProperty(item.itemid)) {
                this.handleMetric(item, itemHistoryFloat[item.itemid], sourceInstance);
            }
        }, this);

        zabbixItemsIntegerUnsigned.forEach(function(item) {
            if (itemHistoryIntegerUnsigned.hasOwnProperty(item.itemid)) {
                this.handleMetric(item, itemHistoryIntegerUnsigned[item.itemid], sourceInstance);
            }
        }, this);

    },

    /**
     * Prepare the  body for the request and sending it
     *
     * @param {Number} valueType - filter for collecting. For example: 0 for items with 
     * floating points values and 3 for items with integer non signed values
     *
     * @returns {Array} Array of Objects with all the items for the passed valueType
     */
    getZabbixItems: function(valueType, hostids) {
        var with_triggers = this.probe.getAdditionalParameter("with_triggers") || "false";

        var parameters = {
            "output": ["itemid", "hostid", "name", "type", "key_"],
            "webitems": "true",
            "selectHosts": ["hostid", "host"],
            "selectInterfaces": ["ip", "port"],
            "selectApplications": ["name"],
            "sortfield": ["itemid"],
            "filter": {
                "value_type": valueType
            },
            "monitored": "true",
        };

        // Add hostids filter only when batch processing is enabled.
        if (isBatchProcessingEnabled) {
            if (hostids.length == 0)
                return [];
            parameters["hostids"] = hostids;
        }

        if (with_triggers == "true") {
            parameters["with_triggers"] = with_triggers.toString();
        }

        var body = this.createRequestBody("item.get", parameters, true);

        try {
            var response = this.createRequest(body);
            if (response.getStatusCode() == 200) {
                var resBody = this.parseJSON(response);

                var items = resBody.result;

                return items;

            } else {
                this.addError(response.getErrorMessage());
                return [];
            }
        } catch (e) {
            this.addError(e.toString());
            return [];
        }
    },

    /**
     * Filtering all the itemids from the getZabbixItems request and prepares 
     * the body where we are requesting the history of the filtered items
     * @param {Array} zabbixItems - Array of objects with all the items from zabbix
     * @param {Number} valueType - filter for collecting. For example: 0 for items with 
     * floating points values and 3 for items with integer non signed values
     *
     * @returns {Array} Array of Objects with the history of the items
     */
    getItemsHistory: function(zabbixItems, valueType) {

        var historyDict = {};
        if (zabbixItems.length == 0)
            return historyDict;

        var itemids = [];
        zabbixItems.forEach(function(item) {
            if (itemids.indexOf(item.itemid) <= -1) {
                itemids.push(item.itemid);
            }
        }, this);

        var body = this.createRequestBody("history.get", {
            "history": valueType,
            "itemids": itemids,
            "time_from": startDate,
            "time_till": endDate,
            "sortfield": "clock",
            "sortorder": "ASC"
        }, true);

        var response = this.createRequest(body);
        var resBody = this.parseJSON(response);

        var historyArr = resBody.result;
        historyArr.forEach(function(history) {
            if (!historyDict.hasOwnProperty(history.itemid))
                historyDict[history.itemid] = [];
            historyDict[history.itemid].push([history.value, history.clock]);
        }, this);

        return historyDict;
    },

    /**
     * We are collecting first the Items and then by their itemids
     * we are collecting their history. Here we are merging both requests by itemids
     *
     * @param items - Array of objects with items
     * @param itemsHistory - Array of objects with the history of the items(matched by itemid)
     *
     * @returns {Array} Array of objects. Items objects merged with their history
     */
    mergeItemToItemHistory: function(items, itemsHistory) {
        items.forEach(function(element) {
            itemsHistory.forEach(function(elementHistory) {
                if (element.itemid == elementHistory.itemid) {
                    for (var prop in element) {
                        elementHistory[prop] = element[prop];
                    }
                }
            }, this);
        }, this);

        return itemsHistory;
    },

    /**
     * In zabbix we can sort by groups, so we pass the groups through additional parameter
     * and we are making a request only for the listed groups
     *
     * @param additionalParamCsv - Additional parameter with metrics in csv format
     *
     * @returns {Array} [...] Array with the values from additionalParamCsv
     */
    getArrayOfStringsFromCsv: function(additionalParamCsv) {
        this.debug(SOURCE + ": Received additional param: " + additionalParamCsv);

        var input = additionalParamCsv.split(",");
        var result = [];

        result = input.map(function(element) {
            return element.trim();
        });

        return result;
    },

    /**
     * Creating raw metrics with RawMetrics constructor and 
     * send them to service now
     *
     * @param {Object} item - Filtered item
     * @param {Array} historyArr - Histrory records for item. It's array of value and clock array - e.g. [[value1, clock1], [value2, clock2]]
     * @param {String} sourceInstance - used for info
     */
    handleMetric: function(item, historyArr, sourceInstance) {

        var metricHandler = MetricFactory.getMetricHandler();
        var ciIdentifier = {};
        var node, metricType, metricValue, metricTimeStamp, monitoredObjType, itemKey;
        var matchNum, replaceWith;
        var applicationsName = "";
        var interfacesIp = "";
        var interfacePort = "";

        if (item.hasOwnProperty("name")) {
            if (item["type"] != 5) {
                metricType = item["name"].replace(/\s?(?:on)?\s?#?\$\d/g, "");
            } else {
                var matches = item["name"].match(/\$\d/g);

                metricType = item["name"];
                if (!!matches && item.hasOwnProperty("key_")) {
                    var keyParams = item["key_"].slice(item["key_"].indexOf("[") + 1, item["key_"].length - 1).split(",");
                    matches.forEach(function(match) {
                        matchNum = match.slice(match.indexOf("$") + 1) - 1;
                        replaceWith = keyParams[matchNum];
                        metricType = metricType.replace(match, replaceWith);
                    });
                } else {
                    metricType = item["name"];
                }
            }
        } else {
            this.debug(SOURCE + ": There is no name property in the filtered item");
        }
        if (item.hasOwnProperty("key_")) {
            itemKey = "" + item["key_"];
            itemKey = itemKey.replace(/\\\//g, "/");
            itemKey = itemKey.replace(/\\{2}/g, "\\");
        } else {
            this.debug(SOURCE + ": There is no key_ property in the filtered item");
        }

        if (item.hasOwnProperty("hosts")) {

            if (item["hosts"].length == 0) {
                this.debug(SOURCE + ": The Array of hosts is empty in the filtered item");
            } else if (item["hosts"].length == 1 && (item["hostid"] == item["hosts"][0]["hostid"])) {
                node = "" + item["hosts"][0]["host"];
            } else {
                item["hosts"].forEach(function(attr) {
                    if (item["hostid"] == attr["hostid"]) {
                        node = "" + attr["host"];
                    }
                }, this);
            }

        }

        if (item.hasOwnProperty("type")) {
            var type = "" + item["type"];
            monitoredObjType = this.getType(type);
        } else {
            this.debug(SOURCE + ": There is no type property in the filtered item");
        }

        if (item.hasOwnProperty("applications")) {

            if (item["applications"].length > 1) {
                var separator;
                item["applications"].forEach(function(application, index) {
                    separator = (index == item["applications"].length - 1) ? "" : ", ";
                    applicationsName += (application["name"] + separator);
                }, this);
            } else if (item["applications"].length == 1) {
                if (item["applications"][0].hasOwnProperty("name")) {
                    applicationsName = "" + item["applications"][0]["name"];
                } else {
                    applicationsName = null;
                }
            } else {
                this.debug(SOURCE + ": The applications list is empty in the filtered item.");
            }

        }

        if (item.hasOwnProperty("interfaces") && item["interfaces"].length > 0) {

            if (item["interfaces"][0].hasOwnProperty("ip")) {
                interfacesIp = "" + item["interfaces"][0]["ip"];
            } else {
                interfacesIp = null;
            }

            if (item["interfaces"][0].hasOwnProperty("port")) {
                interfacePort = "" + item["interfaces"][0]["port"];
            } else {
                interfacePort = null;
            }

        }

        this.setCiIdentifier(ciIdentifier, "node", node);
        this.setCiIdentifier(ciIdentifier, "interfaces_ip", interfacesIp);
        this.setCiIdentifier(ciIdentifier, "interfaces_port", interfacePort);
        this.setCiIdentifier(ciIdentifier, "applications_name", applicationsName);
        this.setCiIdentifier(ciIdentifier, "key", itemKey);

        historyArr.forEach(function(history) {
            metricValue = history[0];
            metricTimeStamp = "" + history[1];
            if (metricTimeStamp.length == 10) {
                metricTimeStamp += "000";
            }

            LAST_METRIC_TIME = parseInt(metricTimeStamp) > parseInt(LAST_METRIC_TIME) ? metricTimeStamp : LAST_METRIC_TIME;

            var rawMetric = new RawMetric(metricType, "", "", node, "", metricValue,
                parseInt(metricTimeStamp), ciIdentifier, SOURCE, sourceInstance, monitoredObjType);

            metricHandler.handleMetric(rawMetric);

            metricCounter++;
        }, this);

    },
    /**
     * Adding attribute to the object 
     *
     * @param ciIdentifier - the object which we will extend
     * @param key - key in string format
     * @param value - value which will be set for the key
     *
     * @returns {Object} ciIdentifier
     */
    setCiIdentifier: function(ciIdentifier, key, value) {
        if (!!value) {
            ciIdentifier[key] = value.toString();
        }
        return ciIdentifier;
    },

    /**
     * Function for returning a mapped value for the Trigger Type between id and String Message
     * @param key the value from Zabbix data
     * @returns {*} Returns the associated map value
     */
    getType: function(key) {
        var map = {
            0: "Zabbix agent",
            1: "SNMPv1 agent ",
            2: "Zabbix trapper",
            3: "simple check",
            4: "SNMPv2 agent",
            5: "Zabbix internal",
            6: "SNMPv3 agent",
            7: "Zabbix agent (active)",
            8: "Zabbix aggregate",
            9: "web item",
            10: "external check",
            11: "database monitor",
            12: "IPMI agent",
            13: "SSH agent",
            14: "TELNET agent",
            15: "calculated",
            16: "JMX agent",
            17: "SNMP trap"
        };
        return map[key];
    },

    /**
     * Function for getting and management of the AUTH_TOKEN that is needed for every request made.
     * @returns {*} a String token ID
     */
    getAuthToken: function() {
        var token = AUTH_TOKEN;
        if (!token) { //Checking for previously set token if the function is called from the same instance.
            var username = this.probe.getParameter("username") || "";
            var password = this.probe.getParameter("password") || "";
            var bodyParams = {
                "password": password
            };
            //From version 6.0.0, the 'user' parameter is deprecated. Therefore, if the current version is greater than or equal to 6.0.0, use the 'username' parameter
            if (this.isCurrentVersionGreaterOrEqual(ZABBIX_VERSION, "6.0.0")) {
                bodyParams["username"] = username;
            } else {
                bodyParams["user"] = username;
            }
            var body = this.createRequestBody("user.login", bodyParams, false);
            var response = this.createRequest(body, false);
            if (!response)
                return;
            var resBody = this.parseJSON(response);
            if (resBody && resBody.error) {
                this.addError("\n RESPONSE ERROR : < Code - " + resBody.error.code + " > < Message - " + resBody.error.message + " > < Description - " + resBody.error.data + " >");
                return;
            }
            if (resBody && resBody.result) {
                token = resBody.result;
                AUTH_TOKEN = token;
            }
            return token;
        } else {
            return token;
        }
    },

    authTokenSignOut: function() {
        var authToken = AUTH_TOKEN;
        var body = this.createRequestBody("user.logout", {}, true);
        var response = this.createRequest(body);
        AUTH_TOKEN = "";
        if (response && response.getStatusCode() == 200) {
            var resBody = this.parseJSON(response);
            if (resBody) {
                if (!resBody.error) {
                    this.debug("Current token: " + authToken + " was successfully logged out!");
                    return;
                } else if (resBody.error && resBody.error.data == "Session terminated, re-login, please.") {
                    this.debug("Current token: " + authToken + " was automatically logged out due to a session termination");
                    return;
                }
            }
        }
        this.debug("Current token: " + authToken + ". There was a problem while logging out!");
    },

    getZabbixVersion: function() {
        var body = this.createRequestBody("apiinfo.version", {}, false);
        var response = this.createRequest(body);
        if (response && response.getStatusCode() == 200) {
            var resBody = this.parseJSON(response);
            if (resBody && resBody.result) {
                ZABBIX_VERSION = resBody.result;
                return ZABBIX_VERSION;
            }
        }
        ms.error("**** ZabbixMetrics_JS CONNECTOR Failed to get the zabbix server version, check host ip and port ****");
        return;
    },

    // If the current Zabbix server version is equal to or greater than the specified version, return true
    isCurrentVersionGreaterOrEqual: function(currentVersion, specifiedVersion) {
        var specifiedVersionSegments = specifiedVersion.split('.').map(Number);
        var currentVersionSegments = currentVersion.split('.').map(Number);
        for (var i = 0; i < Math.max(specifiedVersionSegments.length, currentVersionSegments.length); i++) {
            var specifiedSegment = specifiedVersionSegments[i] || 0;
            var currentSegment = currentVersionSegments[i] || 0;
            if (currentSegment > specifiedSegment) {
                return true; // currentVersion is greater than specifiedVersion
            } else if (currentSegment < specifiedSegment) {
                return false; // currentVersion is less than specifiedVersion
            }
        }
        return true; // versions are equal
    },
    /**
     * Function for generating consistent REST request Body params object.
     * @param method - String with the method of the REST call to be used
     * @param params - JS Object - Query key/value params specific to the ZABBIX REST API
     * @param auth - Boolean
     * @returns a JS Object with the body params needed for a request
     */
    createRequestBody: function(method, params, auth) {
        var body = {
            "jsonrpc": "2.0",
            "method": "",
            "params": {},
            "id": "1"
        };

        if (auth && !this.isCurrentVersionGreaterOrEqual(ZABBIX_VERSION, "6.4.0")) {
            body["auth"] = AUTH_TOKEN;
        }

        if (method) {
            body.method = method;
        }

        if (params) {
            body.params = params;
        }

        return body;
    },

    /**
     * Creating and sending the request
     *
     * @param type - the type of the request [GET, POST, ... ]
     * @param method - the URI of the request
     * @param params - the parameters of the request. For ex: table name, attributes, startDate, endDate
     * @param safeToLog Set to false when content of request body contains sensitive information like server credentials. Default: true
     *
     * @returns {Boolean} return false if the status is different than 200
     * @returns {Object} the response
     */
    createRequest: function(body, safeToLog) {
        safeToLog = safeToLog !== false; // Set to false if caller explicitly sets it to false. True by default for undefined / null
        var method = body["method"];
        var host = this.probe.getParameter("host") || "";
        var port = parseInt(this.probe.getAdditionalParameter("port")) || 80;
        var protocol = this.probe.getAdditionalParameter("protocol") || "http";
        port = (port === 80 ? "" : (":" + port));
        var url = protocol + "://" + host + port + "/zabbix/api_jsonrpc.php";
        var response;

        url = encodeURI(url);

        var request = new HTTPRequest(url);
        request.addHeader('Accept', 'application/json');
        request.addHeader('Content-Type', 'application/json-rpc');
        var authToken = AUTH_TOKEN;
        if (authToken && this.isCurrentVersionGreaterOrEqual(ZABBIX_VERSION, "6.4.0")) {
            request.addHeader("Authorization", "Bearer " + authToken);
        }


        var startTime = new Date().getTime();
        try {

            if (safeToLog) {
                this.logPayload("Posting request to zabbix server with content : " + JSON.stringify(body));
            }

            response = request.post(JSONparser.encode(body));
            if (!response) {
                this.addError(request.getErrorMessage());
                return;
            }
            var resBody = this.parseJSON(response);
            this.logPayload("Response body : " + encoder.encode(resBody));
            if (response.getStatusCode() != 200 || resBody.error) {
                // retry logic for session termination during API requests for the history.get  and item.get methods
                if (resBody.error && resBody.error.data == "Session terminated, re-login, please.") {
                    if (body.method == "user.logout") {
                        return response;
                    } else {
                        AUTH_TOKEN = ""; // Clear the old token and obtain a new authentication token
                        authToken = this.getAuthToken();
                        if (authToken && MAX_RETRY_COUNT > 0) {
                            if (!this.isCurrentVersionGreaterOrEqual(ZABBIX_VERSION, "6.4.0")) {
                                body["auth"] = authToken;
                            }
                            /* Retry a maximum number of times if API requests for the history.get and item.get methods fail, even with a new token.
                            on server side, user can set the token expiration limit  90 seconds to 1 day (default).
                            If user set 90sec expiration then for any reason, an API call takes more than 90 sec,it will execute at most 3 times.
                            */
                            MAX_RETRY_COUNT--;
                            response = this.createRequest(body, safeToLog);
                            MAX_RETRY_COUNT++;
                        }
                    }
                } else {
                    this.addError("\n RESPONSE ERROR : < Code - " + resBody.error.code + " > < Message - " + resBody.error.message + " > < Description - " + resBody.error.data + " >");
                    if (response.getErrorMessage()) {
                        this.addError(" REQUEST ERROR : " + response.getErrorMessage());
                    }
                }
            }

            this.debug("[Zabbix-API-Performance] - " + method + " - duration=" + (new Date().getTime() - startTime) + "ms");
            return response;
        } catch (e) {
            this.addError("ERROR EXECUTING REQUEST: " + response.getErrorMessage());
            this.addError(e.toString());
        }
    },
    /**
     * Parsing the response from string to JSON
     *
     * @param response - response from the http request
     * @returns {Object} the result from the response in JSON format
     */
    getResponseBody: function(response) {
        var body = response.getBody();
        var res = JSONparser.parse(body);
        return res;
    },

    /**
     * Getting lastMetricSignature
     *
     * @param secondsSinceLastFetch - configured from additional param 'max_fetch_interval_min'
     * If the time is more than 'max_fetch_interval_min' we start the fetching from 'max_fetch_interval_min' before current time
     * If the run is INITIAL and we don't have 'lastMetricSignature', we set the time
     * with 'max_fetch_interval_min' back from the current time
     * 
     * @returns {String} lastMetricSignature
     */
    getLastMetricSignature: function(secondsSinceLastFetch) {
        secondsSinceLastFetch = secondsSinceLastFetch || (HIST_DATA_MAX_FETCH_INTERVAL_MINS * 60);
        var now = new Date();
        endDate = now.getTime() - offsetMs;
        var lastMetricSignature = "" + this.probe.getParameter("last_kpi_signature");
        if (StringUtil.nil(lastMetricSignature) || lastMetricSignature == null || lastMetricSignature == "null") {
            lastMetricSignature = 0;
        }

        var passTimeSeconds = (endDate - parseInt(lastMetricSignature)) / 1000;

        if (lastMetricSignature == 0) {
            lastMetricSignature = endDate - (secondsSinceLastFetch * 1000);
            startDate = this.timestampWithoutMiliseconds(lastMetricSignature);
            ms.log(SOURCE + ": MetricCollector: last_kpi_signature was empty. Initializing...lastMetricSignature: " + this.formatDate(new Date(lastMetricSignature).getTime()) + " local time");
        } else if (passTimeSeconds > secondsSinceLastFetch) {
            lastMetricSignature = endDate - (secondsSinceLastFetch * 1000);
            startDate = this.timestampWithoutMiliseconds(lastMetricSignature);
            ms.log(SOURCE + ": MetricCollector: last_kpi_signature was more than " + (secondsSinceLastFetch / 60) + " minutes ago. Starting to fetch from " +
                startDate + " local time. Setting lastMetricSignature to " + this.formatDate(lastMetricSignature) + " local time");
        } else {
            startDate = this.timestampWithoutMiliseconds(lastMetricSignature);
            ms.log(SOURCE + ": MetricCollector: last_kpi_signature was as expected. Starting the fetch from " + startDate + " local time");

        }
        endDate = this.timestampWithoutMiliseconds(endDate);
        return lastMetricSignature + "";
    },

    /**
     * Receiving timestamp with miliseconds and convert it to timestamp without miliseconds,
     * because the zabbix api expect it like this
     *
     * @param timestamp
     *
     * @returns {String} timestamp from 10 digits so to be without miliseconds
     */
    timestampWithoutMiliseconds: function(timestamp) {
        var result;

        if (Number(timestamp) && timestamp.toString().length > 9) {
            result = timestamp.toString().slice(0, 10);
        } else {
            this.debug(SOURCE + ": Invalid timestamp in timeStampWithoutMiliseconds function");
            return;
        }

        return result;
    },

    /**
     * Format the date into string format as per pattern
     *
     * @param timeInMilliseconds
     * @returns {String} The formatted date as per pattern
     */
    formatDate: function(timeInMilliseconds) {
        var pattern = "yyyy/MM/dd HH:mm:ss.SSS";

        var format = new SimpleDateFormat(pattern);
        var lastMetricDate = new Date(parseInt(timeInMilliseconds));
        var dateFormat = format.format(lastMetricDate);

        return "" + dateFormat;
    },

    /**
     * Parsing the response from string to JSON
     *
     * @param response - response from the http request
     * @returns {Object} the result from the response in JSON format
     */
    parseJSON: function(response) {
        var parser = new JSONParser();
        var resultJson = parser.parse(response.getBody());
        if (!!resultJson.result.length) {
            this.debug(SOURCE + ": Found " + resultJson.result.length + " records");
        }

        return resultJson;

    },

    /**
     * Concatenating a message to errorMessage variable
     *
     * @param message
     */
    addError: function(message) {
        if (errorMessage === "")
            errorMessage = SOURCE + ": " + message;
        else
            errorMessage += "\n" + message;
        ms.log(message);
    },

    /**
     * Logging payload and event object if the additional parameter logPayloadForDebug is set to be true
     *
     * @param message
     */
    logPayload: function(message) {
        if (islogPayloadForDebug == true || islogPayloadForDebug == "true") {
            ms.log(SOURCE + ": Payload: " + message);
        }
        return true;
    },

    /**
     * Logging a message if the additional parameter isDebug is set to be true
     *
     * @param message
     */
    debug: function(message) {
        if (isDebug == true || isDebug == "true") {
            ms.log(SOURCE + ": " + message);
        }
        return true;
    },

    type: "ZabbixMetrics_JS"
});

ZabbixMetrics_JS.get = function(probe) {
    ms.log("ZabbixMetrics_JS invoked");
    return new ZabbixMetrics_JS(probe);
};
