var ScomJS = Class.create();
var SCRIPT_LOCATION = 'Powershell';
var SCRIPT_NAME = 'Invoke-UpdateAlert';
var METRIC_SCRIPT_NAME = 'FetchMetricData';
var POWERSHELL_EXTENSION = '.ps1';
var FileSystem = Packages.com.service_now.mid.services.FileSystem;
var SUCCESS = Packages.com.service_now.mid.probe.tpcon.OperationStatusType.SUCCESS;
var FAILURE = Packages.com.service_now.mid.probe.tpcon.OperationStatusType.FAILURE;
var StringUtil = Packages.com.glide.util.StringUtil;
var errorMessage = "";
var useWindowsAuthentication = false;
var isDebug = false;
var islogPayloadForDebug = false;
// there is a limit of command line length - 8191 characters, therefore json can include ~62 alerts at most
var MAXIMUM_ALERTS = 50;
ScomJS.prototype = Object.extendsObject(AProbe, {
    updateSource: function() {
        ms.log("SCOM Bi-directional: Updating the source");
        var pathToScript = FileSystem.get().getScript(SCRIPT_LOCATION).getAbsolutePath() + "\\" + SCRIPT_NAME + POWERSHELL_EXTENSION;
        ms.log("PATH: " + pathToScript);
        var version = this.getParamValue("scom_version", "2007");
        var allowedVersions = ["2016", "2019", "2022", "2025"];
        if (allowedVersions.includes(version))
            version = "2012";
        var stop_isMonitorAlert_bidirectional = false;
        stop_isMonitorAlert_bidirectional = this.probe.getAdditionalParameter('stop_isMonitorAlert_bidirectional');
        if (StringUtil.notNil(stop_isMonitorAlert_bidirectional) && stop_isMonitorAlert_bidirectional == "true") {
            stop_isMonitorAlert_bidirectional = true;
        }else{
            stop_isMonitorAlert_bidirectional = false;
        }
        isDebug = this.getParamValue("debug_enabled", false);
        islogPayloadForDebug = this.getParamValue("logPayloadForDebug", false);
        var jsonStr = this.probe.getAdditionalParameter("alerts");
        ms.log("JSON: " + jsonStr);
        var pathToDll = FileSystem.get().getHomeDir() + "";
        jsonStr = jsonStr + '';
        var objJSON = JSON.parse(jsonStr);
        var command = '';
        var argument = '';
        var jsonRes = '';
        var username = this.probe.getParameter("username");
        var password = this.probe.getParameter("password");
        var host = this.probe.getParameter("host");
        var result = false;
        var retVal = {};
        var use_windows_authentication_str = this.probe.getAdditionalParameter("login_with_windows_authentication");
        if (StringUtil.notNil(use_windows_authentication_str) && use_windows_authentication_str == "true") {
            useWindowsAuthentication = true;
        }
        password = this.escapeString(password + "");
        username = this.escapeString(username + "");
        retVal = this.checkForPowershellVersion();
        if (retVal != null) {
            return retVal;
        }
        retVal = {};
        if (objJSON == null) {
            this.addError("Received json is empty");
            retVal['status'] = "" + FAILURE.toString();
            retVal['error_message'] = errorMessage;
            return retVal;
        }
        var alertsToSend = [];
        var alertId = 0;
        for (var i = 0; i < objJSON.length; ++i) {
            var alert = objJSON[i];
            var is_monitor_flag = false;
            // Added this flag during dequeueAndProcess in ConnectorQueue
            is_monitor_flag = alert.is_monitor_flag;
            if (!(stop_isMonitorAlert_bidirectional && is_monitor_flag)) {
                for (var j = 0; j < alert.value.length; ++j) {
                    if (alert.value[j].fieldName === 'incident' || alert.value[j].fieldName === 'remote_task_id') {
                        command = 'ticket_id';
                        argument = alert.value[j].newValue;
                    }
                    if (alert.value[j].fieldName === 'state' && (alert.value[j].oldValue === 'Open' || alert.value[j].oldValue === 'Reopen') && alert.value[j].newValue === 'Closed') {
                        command = 'close';
                    }
                    if (alert.value[j].fieldName === 'state' && alert.value[j].oldValue === 'Closed' && (alert.value[j].newValue === 'Open' || alert.value[j].newValue === 'Reopen')) {
                        command = 'open';
                    }
                    if (command != '') {
                        this.probe.setParameter("action_performed", "true");
                        alertsToSend[alertId] = {};
                        alertsToSend[alertId].id = alert.key;
                        alertsToSend[alertId].command = command;
                        alertsToSend[alertId].ticket_id = argument;
                        command = '';
                        argument = '';
                        alertId++;
                        if (alertId == MAXIMUM_ALERTS) {
                            jsonRes = JSON.stringify(alertsToSend);
                            result = this.sendAlerts(jsonRes, pathToScript, username, password, host, pathToDll, version);
                            if (result == false) {
                                retVal['status'] = "" + FAILURE.toString();
                                retVal['error_message'] = errorMessage;
                                return retVal;
                            }
                            alertsToSend = [];
                            alertId = 0;
                        }
                    }
                }
            }
        }
        if (alertId < MAXIMUM_ALERTS && alertsToSend.length > 0) {
            jsonRes = JSON.stringify(alertsToSend);
            this.logPayload("SCOM- Bi directional Alert to send: " + jsonRes);
            result = this.sendAlerts(jsonRes, pathToScript, username, password, host, pathToDll, version);
            if (result == false) {
                retVal['status'] = "" + FAILURE.toString();
                retVal['error_message'] = errorMessage;
                return retVal;
            }
        }
        retVal['status'] = "" + SUCCESS.toString();
        return retVal;
    },
    sendAlerts: function(jsonAlerts, pathToScript, username, password, host, pathToDll, version) {
        jsonAlerts = jsonAlerts.replace(/\"/g, "\\\"");
        ms.log(jsonAlerts);
        pathToScript = this.replaceSpecialCharacters(pathToScript);
        pathToDll = this.replaceSpecialCharacters(pathToDll);
        if (useWindowsAuthentication) {
            username = "user";
            password = "password";
        }
        var commandToRun = "powershell -executionpolicy unrestricted -noninteractive -command \"& { . " + pathToScript + "; " + SCRIPT_NAME + " " + useWindowsAuthentication + " " + username + " " + password + " " + host + " " + "\"" + pathToDll + "\"" + " " + version + " '" + jsonAlerts + "' }\"";
        var commandToPrint = "powershell -executionpolicy unrestricted -noninteractive -command \"& { . " + pathToScript + "; " + SCRIPT_NAME + " " + useWindowsAuthentication + " ***** ***** " + host + " " + pathToDll + " " + version + " '" + jsonAlerts + "' }\"";
        ms.log("COMMAND: " + commandToPrint);
        var commandRetVal = EventManagementUtil.get().runCommand(commandToRun);
        var errorMessageToReturn = commandRetVal['error'] + "";
        if (StringUtil.notNil(errorMessageToReturn) && errorMessageToReturn != 'undefined') {
            ms.log("SCOM Bi-directional: STATUS ERROR: " + errorMessageToReturn);
            this.addError(errorMessageToReturn);
            return false;
        }
        ms.log("SCOM Bi-directional: STATUS: SUCCESS");
        return true;
    },
    // DEF0225081- Supporting parenthese in the Invoke-Update.ps1 file path
    replaceSpecialCharacters: function(path) {
        path = path.replaceAll(" ", '` ');
        path = path.replaceAll('(', '`(');
        path = path.replaceAll('{', '`{');
        path = path.replaceAll('[', '`[');
        path = path.replaceAll(')', '`)');
        path = path.replaceAll('}', '`}');
        path = path.replaceAll(']', '`]');
        return path;
    },
    retrieveKpi: function() {
        var retval = MetricCollector.get(this.probe).retrieveKpi();
        return retval;
    },
    addError: function(message) {
        if (errorMessage === "")
            errorMessage = message;
        else
            errorMessage += "\n" + message;
        ms.log(message);
    },
    escapeString: function(stringToEscape) {
        var escapedString = "";
        for (var i = 0; i < stringToEscape.length; i++) {
            var re = new RegExp("[^A-Za-z0-9]");
            if (re.test(stringToEscape[i]))
                escapedString += "`" + stringToEscape[i];
            else
                escapedString += stringToEscape[i];
        }
        return escapedString;
    },
    debug: function(message) {
        if (isDebug == true || isDebug == "true") {
            ms.log("SCOM Bi-directional: " + message);
        }
        return true;
    },
    logPayload: function(message) {
        if (islogPayloadForDebug == true || islogPayloadForDebug == "true") {
            ms.log("SCOM Bi-directional payload: " + message);
        }
        return true;
    },
    getParamValue: function(paramName, defaultValue) {
        var param = this.probe.getAdditionalParameter(paramName);
        if (StringUtil.nil(param))
            param = defaultValue;
        return param;
    },
    type: "ScomJS"
});
