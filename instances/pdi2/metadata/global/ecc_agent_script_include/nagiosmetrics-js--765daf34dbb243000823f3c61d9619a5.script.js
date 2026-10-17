var NagiosMetrics_JS = Class.create();

// MID
var MetricFactory = Packages.com.service_now.metric.MetricFactory;
var StringUtil = Packages.com.glide.util.StringUtil;
var RawMetric = Packages.com.service_now.metric.model.RawMetric;
var DriverManager = Packages.java.sql.DriverManager;
var ResultSet = Packages.java.sql.ResultSet;

// Constants
var SUCCESS = Packages.com.service_now.mid.probe.tpcon.OperationStatusType.SUCCESS;
var FAILURE = Packages.com.service_now.mid.probe.tpcon.OperationStatusType.FAILURE;
var SOURCE = "Nagios";
var HIST_DATA_MAX_FETCH_INTERVAL_MINS = 180;
var DEFAULT_DATABASE_PORT = "3306";
var DEFAULT_INSTANCE_NAME = "nagios";
var HOST_TYPE = "hosts";
var SERVICE_TYPE = "services";

// Globals
var offsetMs = 300000;
var isTesting = false;
var isDebug = false;
var hostsLastKpi = "null",
	servicesLastKpi = "null";
var splittedLastKpiSignature;
var totalNumberOfMetricRecords = 0;
var sourceInstance;
var instanceName;
var errorMessageToReturn = "";

NagiosMetrics_JS.prototype = Object.extendsObject(AProbe, {
	initialize: function(probe) {
	  this.probe = probe;
    },
	/**
	 testConnection : The function is meant to establish if the connection the RESTful API from
	 Nagius is active and running. This is done by probing the Nagius API for it's own version.
	 Cases that the function follows are:
	 - Nagius API is running and returns status code 200 -> OK
	 - Nagius API is not running, or no connection on the selected host is available, or Port(proxy)
	 hasn't been setup, will be caught by the try/catch block, and will print out to the Log the error message
	 from the response, and also indicate the Status Code of the response -> FAILURE
	 */
    testConnection : function() {
        ms.log(SOURCE + ": testing connection");
        var retVal = {};

		try {
			isTesting = true;
		    var jdbcURL;
		    var host =  this.probe.getParameter("host");
			var databaseUserName = this.probe.getParameter("database_username");
		    var databasePassword = this.probe.getParameter("database_password");
			var databasePort = this.probe.getParameter("database_port");

			if(!databasePort) {
				this.debug("Missing database_port. Setting default MySQL port 3306.");
				databasePort = DEFAULT_DATABASE_PORT;
			}

			instanceName = this.probe.getParameter("instanceName");

			if(!instanceName) {
				this.debug("Missing instanceName. Setting to default DB Instance 'nagios' .");
				instanceName = DEFAULT_INSTANCE_NAME;
			}
			
			Class.forName("com.mysql.jdbc.Driver");
			
			jdbcURL = this.getJDBCUrl(host, databasePort);
			conn = DriverManager.getConnection(jdbcURL, databaseUserName, databasePassword);

			statement = conn.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);

	        var SQLCommand = this.getSQLCommand();

		    rs = statement.executeQuery(SQLCommand);
		    while (rs.next()) {
		    	var version = "" + rs.getString("version");
		    	var intMainVersion = parseInt(version[0], 10);
		    	ms.log(SOURCE + ": TEST CONNECTION RESULT -> " + rs.getString("name") + ", " + version);
		    	// Showing an error if the version is less than 2
		    	if(!isNaN(intMainVersion) && intMainVersion < 2) {
		    		retVal["error_message"] = "Nagios version is older than expected. Please have in mind that the connector is build for version 2+ and can work not as expected!";
		    		retVal["status"] = FAILURE.toString();
		    	} else if(isNaN(intMainVersion)) {
		    		retVal["error_message"] = "Nagios version is not a number. Please check!";
		    		retVal["status"] = FAILURE.toString();
		    	}
		    }
		} catch (e) {
			ms.log(e.toString());
			retVal["error_message"] = e.toString();
			retVal["status"] = FAILURE.toString();
		} finally {
			// Close the connection after the data has been handled
			try { if (conn) conn.close(); } catch ( e) {}
			try { if (rs) rs.close(); } catch ( e) {}
			try { if (statement) statement.close(); } catch ( e) {}
		}
		
		if(retVal["status"] != "FAILURE") {
			retVal["status"] = SUCCESS.toString();
		}
		ms.log(SOURCE + ": Connector testConnection:" + retVal["status"]);

		return retVal;
	},

	/**
	 * Function that the MID server uses to RUN the script. Main logic lies here.
	 * This is the code that the MID Server will run on each Iteration.
	 * @returns An Object with specidfic associated Script return values [status,last_event]
	 */
    execute: function() {
        ms.log(SOURCE + " - Nagios Connector: execute connection ...");
    	var retVal = {};

        retVal["status"] = SUCCESS.toString();
        return retVal;
    },

	/**
	 * Function that the MID server uses to RUN the script for the metrics. Main logic lies here.
	 * This is the code that the MID Server will run on each Iteration for the metrics.
	 * @returns An Object with specidfic associated Script return values [status,last_kpi_signature,error]
	 */
	retrieveKpi: function() {
		
		this.debug("Nagios Metrics Collection Initiated...");
		
		var host =  this.probe.getParameter("host");
		var startTime = new Date();
		var conn, statement, rs, SQLCommandHosts, SQLCommandServices, isValidNumber, secondsSinceLastFetch, rsHosts, rsServices;

    	isDebug = "" + this.probe.getAdditionalParameter("debug");
    	ms.log("isDebug: " + isDebug);

		sourceInstance =  this.probe.getParameter("connector_name");
		offsetMs = this.probe.getAdditionalParameter("offset_min") * 60000 || 300000;
		
		// Additional param which indicates in minutes, how much time we should go back for the initial run
		// Also for example if the connector was stopped for X time and we run it. If the time between
		// current time and LAST_METRIC_TIME is more than 'maxFetchIntervalMin', we are starting the fetch
		// from current time minus(-) maxFetchIntervalMin.
		// This is a safe mechanism just to be on the safe side, because otherwise we can overflow the MID.
		var maxFetchIntervalMin = this.probe.getAdditionalParameter("max_fetch_interval_min");

		if(StringUtil.nil(maxFetchIntervalMin)) {
			secondsSinceLastFetch = HIST_DATA_MAX_FETCH_INTERVAL_MINS * 60;
			ms.log(SOURCE + ": max_fetch_interval_min is empty or missing! Please check the definition. We are setting it to " + HIST_DATA_MAX_FETCH_INTERVAL_MINS);
		} else {
			maxFetchIntervalMin = parseInt(maxFetchIntervalMin);
			isValidNumber = maxFetchIntervalMin > 0 ? true : false;
			
			if(isValidNumber) {
				secondsSinceLastFetch = maxFetchIntervalMin * 60;
			} else {
				secondsSinceLastFetch = HIST_DATA_MAX_FETCH_INTERVAL_MINS * 60;
				ms.log(SOURCE + ": max_fetch_interval_min is not valid! Please double check and enter minutes. We are setting it to " + HIST_DATA_MAX_FETCH_INTERVAL_MINS);
			}
		}

		// Array with last times for HOSTS and SERVICES
		splittedLastKpiSignature = this.splitLastKpiSignature(secondsSinceLastFetch);

		try {
			var databaseUserName = this.probe.getParameter("database_username");
		    var databasePassword = this.probe.getParameter("database_password");
			var databasePort = this.probe.getParameter("database_port");

			if(!databasePort) {
				this.debug("Missing database_port. Setting default MySQL port 3306.");
				databasePort = DEFAULT_DATABASE_PORT;
			}

			instanceName = this.probe.getParameter("instanceName");

			if(!instanceName) {
				this.debug("Missing instanceName. Setting to default DB Instance 'nagios' .");
				instanceName = DEFAULT_INSTANCE_NAME;
			}

		    var jdbcURL;

			Class.forName("com.mysql.jdbc.Driver");

			this.debug("NagiosMetrics: connecting with local database user");

			jdbcURL = this.getJDBCUrl(host, databasePort);
			conn = DriverManager.getConnection(jdbcURL, databaseUserName, databasePassword);
			statement = conn.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);
			// For better performance
			// Example: So if the RESULT-SET has 100 rows and the fetch-size is 10, there will be 10 network calls to retrieve all of the data, using roughly 10*{row-content-size} RAM 
			// at any given time.
		    statement.setFetchSize(5000);

	        SQLCommandHosts = this.getSQLCommand(HOST_TYPE);
	        this.debug("Hosts Query: " + SQLCommandHosts);
		    rsHosts = statement.executeQuery(SQLCommandHosts);
			while (rsHosts.next()) {
				this.handleMetric(rsHosts, HOST_TYPE)
			}

	        SQLCommandServices = this.getSQLCommand(SERVICE_TYPE);
	        this.debug("Services Query: " + SQLCommandServices);
		    rsServices = statement.executeQuery(SQLCommandServices);
			while (rsServices.next()) {
				this.handleMetric(rsServices, SERVICE_TYPE)
			}

	     } catch (err) {
	     	errorMessageToReturn = err.message;
	     } finally {
	     	// Close the connection after the data has been handled
			 try { if (conn) conn.close(); } catch ( e) {}
			 try { if (rsHosts) rsHosts.close(); } catch ( e) {}
			 try { if (rsServices) rsServices.close(); } catch ( e) {}
			 try { if (statement) statement.close(); } catch ( e) {}
	     }

        var totalDuration = Number((new Date().getTime() - startTime.getTime()));
		var totalDurationSec = (totalDuration / 1000).toFixed(3);
		if(totalNumberOfMetricRecords > 0 && totalDurationSec > 0) {
			ms.log("NagiosMetrics handle total of " + totalNumberOfMetricRecords + " metrics in " + totalDurationSec + " seconds (" + Number(totalNumberOfMetricRecords/totalDurationSec).toFixed(3) + " per second)");
		}
		
		retVal = this.getReturnVal(errorMessageToReturn);
		retVal['last_kpi_signature']  = hostsLastKpi + ", " + servicesLastKpi;
		retVal['metric_source']  = "" + SOURCE;
		if(totalNumberOfMetricRecords > 0) {
			retVal['metric_count']  = "" + totalNumberOfMetricRecords;
			retVal['metric_duration']  = "" + totalDuration;
		}

	 	return retVal;
   },

	/**
	* Prepare url for the database connection
	*
	* @param {String} host - The host got from the getParam. For example "10.1.1.155" 
	* @param {String} databasePort 
	*
	* @returns {String} url for the databese connection
	*/
   getJDBCUrl: function(host, databasePort) {
		var jdbcURL;

		jdbcURL = "jdbc:mysql://" + host + ":" + databasePort;

		return jdbcURL;
   },

	/**
	 * Prepare the retVal object to return the type of the status with the error message if it Fails
	 *
	 * @param {String} errorMessageToReturn - string collecting the errors
	 *
	 * @returns {Object} Object with status and error_messages if needed
	 */
    getReturnVal: function(errorMessageToReturn) {
		var retVal = {};
		if (StringUtil.notNil(errorMessageToReturn) && errorMessageToReturn != 'undefined') {
			retVal['status']  = "" + FAILURE.toString();
			retVal['error_message'] = errorMessageToReturn + "";
			ms.log("NagiosMetrics: STATUS: ERROR: " + errorMessageToReturn);
		} else {
			retVal['status']  = "" + SUCCESS.toString();
			ms.log("NagiosMetrics: STATUS: SUCCESS");
		}
		
		return retVal;
    },

	/**
	 * Prepare the SQL query
	 *
 	 * @param {String} type - two types for the query. hosts and services
	 *
	 * @returns {String} sqlCommand with needed query
	 */
	getSQLCommand: function(type) {
		var sqlCommand,
			orderBy,
			idClause;

		if(splittedLastKpiSignature.length > 0) {
			if(type == "hosts") {
				hostsLastKpi = "" + splittedLastKpiSignature[0];
			}
			else if(type == "services") {
				servicesLastKpi = "" + splittedLastKpiSignature[1];
			}
		}

		if(isTesting) {
			sqlCommand = "SELECT * FROM " + instanceName + ".nagios_dbversion";
		} else {
			if(type == "hosts") {

				sqlCommand = "SELECT * FROM (SELECT hostchecks.instance_id, hostchecks.hostcheck_id, hostchecks.command_args, hostchecks.host_object_id,command_object_id,cast(concat(unix_timestamp(end_time), '000000') + end_time_usec AS unsigned) AS time_usec,output,long_output,perfdata, hosts.address AS host_address, hosts.alias AS host_alias FROM " + instanceName + ".nagios_hostchecks AS hostchecks JOIN nagios.nagios_hosts AS hosts ON hostchecks.host_object_id = hosts.host_object_id AND hostchecks.instance_id = hosts.instance_id JOIN nagios.nagios_objects AS objects ON hostchecks.command_object_id = objects.object_id WHERE perfdata != '' ORDER BY time_usec DESC) AS hoschecks WHERE time_usec > " + hostsLastKpi;
			} else if (type == "services") {

				sqlCommand = "SELECT * FROM (SELECT servicechecks.instance_id,servicecheck_id, servicechecks.service_object_id,services.check_command_object_id, services.display_name, services.check_command_args,cast(concat(unix_timestamp(end_time), '000000') + end_time_usec AS unsigned) AS time_usec,output,long_output,perfdata, objects.name1 AS host_name, objects.name2 AS service_type, commands.command_line,objects2.name1 AS command_name FROM " + instanceName + ".nagios_servicechecks AS servicechecks JOIN nagios.nagios_objects AS objects ON servicechecks.service_object_id = objects.object_id AND servicechecks.instance_id = objects.instance_id JOIN nagios.nagios_services AS services ON nagios.servicechecks.service_object_id = services.service_object_id JOIN nagios.nagios_commands AS commands ON services.check_command_object_id = commands.object_id JOIN nagios.nagios_objects AS objects2 ON commands.object_id=objects2.object_id WHERE perfdata != '' ORDER BY time_usec DESC) AS servicechecks WHERE time_usec > " + servicesLastKpi;

			} else {
				ms.log(SOURCE + ": There is no matching type in getSQLCommand. Please check");
			}
		}

		return sqlCommand;
    },

	/**
	 * Creating raw metrics with RawMetrics constructor 
	 *
 	 * @param {ResultSet} rs - current ResultSet obj
 	 * @param {String} type - resultSet data type(hosts or services)
	 */
	handleMetric: function(rs, type) {
		var metricHandler = MetricFactory.getMetricHandler();
		var ciIdentifier = {};
		var displayName = "";
		var metricType,
			metricValue,
			perfdataString,
			perfdata,
			resource,
			node,
			timestamp,
			revisedTimestamp,
			monitoredObjType;


		if(type == "hosts") {
			var hostcheckId = "";
			monitoredObjType = "HostCheck";

			resource = rs.getString("host_alias");
			if(resource == "" || resource == "null") {
				resource = rs.getString("host_address");
			}

			node = resource;

			perfdataString = rs.getString("perfdata");

			//Extracts the metrics from string
			//rta=0.000ms;3000.000;5000.000;0; pl=100%;80;100;; rtmax=0.000ms;;;; rtmin=0.000ms;;;;
			perfdata = this.perfdataFilter(perfdataString);

			timestamp = "" + rs.getString("time_usec");

			hostsLastKpi = parseInt(timestamp) > parseInt(hostsLastKpi) ? timestamp : hostsLastKpi;
			// We are receiving the timestamp with 16 digits till micro seconds, so for sending
			// them to SNOW we need to recuce the timestamp to mili seconds
			revisedTimestamp = this.parseTimestamp(timestamp);
			
			this.setCiIdentifier(ciIdentifier, "command_args", rs.getString("command_args"));

		} else if(type == "services") {
			var servicecheckId = "";
			monitoredObjType = rs.getString("service_type");;

			resource = rs.getString("host_name");
			if(resource == "" || resource == "null") {
				this.debug(SOURCE + ": resource is empty for ServiceChecks!");
			} else {
				node = resource;
			}

			perfdataString = rs.getString("perfdata");

			//Extracts the metrics from string
			//rta=0.000ms;3000.000;5000.000;0; pl=100%;80;100;; rtmax=0.000ms;;;; rtmin=0.000ms;;;;
			perfdata = this.perfdataFilter(perfdataString);

			timestamp = "" + rs.getString("time_usec");
			servicesLastKpi = parseInt(timestamp) > parseInt(servicesLastKpi) ? timestamp : servicesLastKpi;

			// We are receiving the timestamp with 16 digits till micro seconds, so for sending
			// them to SNOW we need to recuce the timestamp to mili seconds
			revisedTimestamp = this.parseTimestamp(timestamp);
            displayName = rs.getString("display_name");
			this.setCiIdentifier(ciIdentifier, "command_name", rs.getString("command_name"));
			this.setCiIdentifier(ciIdentifier, "display_name", rs.getString("display_name"));
			this.setCiIdentifier(ciIdentifier, "command_line", rs.getString("command_line"));
			this.setCiIdentifier(ciIdentifier, "check_command_args", rs.getString("check_command_args"));

		} else {
			ms.log(SOURCE + ": Wrong metric type. Please check createRawMetric");
		}
		ciIdentifier["node"] = node;	
		ciIdentifier["resource"] = resource;

		perfdata.forEach(function(el, index) {
			metricType = el["key"];
			if(displayName != "") {
				metricType = displayName + ":" + metricType;
			}
			metricValue = this.extractTypeFromStr(el["value"]); 
			// Jakarta's constructor:
			// public RawMetric(String metricType, String metricTypeId, String resource, String node, String ci, float value, long timestamp,
			// Map<String, String> ciIdentifier, String source, String sourceInstance, String monitoredObjType)
			var rawMetric = new RawMetric(metricType, "", resource, node, "", parseFloat(metricValue["value"]), revisedTimestamp, ciIdentifier, SOURCE, sourceInstance, monitoredObjType);

			try {
				metricHandler.handleMetric(rawMetric);
			}
			catch(e) {
				ms.log(e.toString);
				errorMessageToReturn += e.toString;
			}

			totalNumberOfMetricRecords++;
		}, this);
	},

	/**
	 * Parsing the 16 digits timestamp to 13 digit so we can apply it to RawMetric constructor
	 *
 	 * @param {String} timestamp - current metric time stamp(16 digits) in string format
 	 *
 	 * @returns {Number} result - 13 digit timestamp
	 */
	parseTimestamp: function(timestamp) {
		// We need the timestamp only till miliseconds
		var result = parseInt(timestamp) / 1000;

		// Removing the digits after the decimal point
		result = parseInt(result);

		return result;
	},

	/**
	 * Extracts the metrics from string
	 * Example:
	 * rta=0.000ms;3000.000;5000.000;0; pl=100%;80;100;; rtmax=0.000ms;;;; rtmin=0.000ms;;;;
	 *
 	 * @param {String} perfdataString - the metric perfdata as per the example above in string format
 	 *
 	 * @returns {Object} perfdata
	 */
	perfdataFilter: function(perfdataString) {
		var perfdata;
		
		perfdata = this.initialSplitMetricString(perfdataString);
		perfdata = this.splitByWhiteSpace(perfdata);
		perfdata = this.splitBySemicolon(perfdata);
		perfdata = this.concatInObjects(perfdata);

		return perfdata;
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
	 * Getting lastMetricSignature with the last times for hosts and services separated 
	 * by comma(first is for HOST, the second is for SERVICE)
	 * 
 	 * @param secondsSinceLastFetch - configured from additional param 'max_fetch_interval_min'
 	 * If the time is more than 'max_fetch_interval_min' we start the fetching from 'max_fetch_interval_min' before current time
 	 * If the run is INITIAL and we don't have 'lastMetricSignature', we set the time
 	 * with 'max_fetch_interval_min' back from the current time
 	 * Have in mind we have two last metric times(host and service) so this logic will be implemented for both times
 	 * separated.
 	 * 
 	 * @returns {Array} lastMetricSignature with the last times for hosts and services separated by comma(first is for HOST,
 	 * the second is for SERVICE) 
	 */
	splitLastKpiSignature: function(secondsSinceLastFetch) {
		// Set to (HIST_DATA_MAX_FETCH_INTERVAL_MINS * 60) if it's not passed as parameter
		secondsSinceLastFetch = secondsSinceLastFetch || (HIST_DATA_MAX_FETCH_INTERVAL_MINS * 60);
		var secondsSinceLastFetchForHosts, secondsSinceLastFetchForServices;
	 	var now =  new Date();
		var lastKpiSignature = this.probe.getParameter("last_kpi_signature") || 0;

		// Only for the initializing of lastMetricSignature
		if(lastKpiSignature == 0) {
			var initTime =  this.getHistoricalTime(now.getTime(), secondsSinceLastFetch);
			lastKpiSignature = [];
			// We are initializing the both times, for services and hosts
			lastKpiSignature.push(initTime, initTime);
			ms.log(SOURCE + ": MetricCollector: last_kpi_signature was empty. Initializing...lastMetricSignature: " + lastKpiSignature);
		} else {
			lastKpiSignature = lastKpiSignature.toString().split(",");

			if(lastKpiSignature.length == 2) {
				lastKpiSignature = lastKpiSignature.map(function(el) {
														return el.trim();
													}, this);
			} else {
				this.debug(SOURCE + ": The lastKpiSignature doesn't contains 2 elements. Please check in 'splitLastKpiSignature' function");
			}

			// Because we need to have 2 types of times, for hosts and services,
			// so we need to check separately for these two types if the last collected metric is with
			// time not bigger than the limit from the additional parameter max_fetch_interval_min
			secondsSinceLastFetchForHosts = this.getSecondsSinceLastFetch(now, lastKpiSignature[0]);
			secondsSinceLastFetchForServices = this.getSecondsSinceLastFetch(now, lastKpiSignature[1]);
	  		// HOST
	  		lastKpiSignature[0] = this.setLastKpiSignature(lastKpiSignature[0], now, secondsSinceLastFetchForHosts, secondsSinceLastFetch, HOST_TYPE);
			// SERVICE
	  		lastKpiSignature[1] = this.setLastKpiSignature(lastKpiSignature[1], now, secondsSinceLastFetchForServices, secondsSinceLastFetch, SERVICE_TYPE);
		}
		// Returns array with the last times for hosts and services separated by comma(first is for HOST, the second is for SERVICE)
		return lastKpiSignature;
	},

	/**
	 * We need the time difference between current time and the lastKpiSigniture
	 *
 	 * @param {Date} currentTime - Date object
 	 * @param {String} lastKpiSignature - last metric time in string format
 	 *
 	 * @returns {Number} The time diff between current time and the lastKpiSigniture in seconds 
	 */
	getSecondsSinceLastFetch: function(currentTime, lastKpiSignature) {
		lastKpiSignature = "" + lastKpiSignature;
		return (currentTime.getTime() - parseInt(lastKpiSignature.slice(0, lastKpiSignature.length - 3))) /1000;
	},

	/**
  	 * If the connector instance was stopped for more than secondsSinceLastFetch( 
  	 * can be configurable by additional parameter)
  	 * we start the collection from (current time - secondsSinceLastFetch) like the initial run
	 *
 	 * @param {String} lastKpiSignature - last saved time for the type
 	 * @param {Date} currentTime - Date object
 	 * @param {Number} secondsSinceLastFetchForType - Time difference between current time and last metric time
 	 * @param {Number} secondsSinceLastFetch - configured from additional param 'max_fetch_interval_min'
 	 * If the time is more than 'max_fetch_interval_min' we start the fetching from 'max_fetch_interval_min' before current time
 	 * If the run is INITIAL and we don't have 'lastMetricSignature', we set the time
 	 * with 'max_fetch_interval_min' back from the current time
 	 * @param {String} type - the type in string format(hosts/services)
 	 * 
 	 * @returns {String} Resulted time for the type with 16 digit(we need the time to be with the micro seconds)
	 */
	setLastKpiSignature: function(lastKpiSignature, currentTime, secondsSinceLastFetchForType, secondsSinceLastFetch, type) {
		if(lastKpiSignature == "null" || (secondsSinceLastFetchForType > secondsSinceLastFetch)) {
			lastKpiSignature = this.getHistoricalTime(currentTime.getTime(), secondsSinceLastFetch);
			
			ms.log(SOURCE + ": last_kpi_signature for " +  type + " is initialinzing or was more than " + (secondsSinceLastFetch / 60) + " minutes ago Starting to fetch for " +  type + " from " + lastKpiSignature);

			return lastKpiSignature;

		} else {
			// Offset the end time
			lastKpiSignature = lastKpiSignature - (offsetMs * 1000);
			
			ms.log(SOURCE + ": last_kpi_signature for " +  type + " was as expected. Starting the fetch from " + lastKpiSignature);
			
			return lastKpiSignature;
		}
	},

	/**
	 * If we are in initial run or last metric time is bigger than secondsSinceLastFetch, we are setting
	 * the lastMetricSignature to (now - secondsSinceLastFetch).
	 *
 	 * @param timestamp - current time
 	 * @param secondsSinceLastFetch - configured from additional param 'max_fetch_interval_min'
 	 * If the time is more than 'max_fetch_interval_min' we start the fetching from 'max_fetch_interval_min' before current time
 	 * If the run is INITIAL and we don't have 'lastMetricSignature', we set the time
 	 * with 'max_fetch_interval_min' back from the current time
 	 * 
 	 * @returns {String} Resulted time with 16 digits(we need the time to be with the micro seconds)
	 */
    getHistoricalTime: function(timestamp, secondsSinceLastFetch) {
    	var result = (timestamp - (secondsSinceLastFetch * 1000)) * 1000;

    	return result + "";
    },

	/**
	 * We are receiving concat string with metrics. 
	 * For ex: rta=0.206ms;3000.000;5000.000;0; pl=0%;80;100;; rtmax=0.491ms;;;; rtmin=0.115ms;;;;
	 * In the above example metrics are only these which are assigned to some value with '='
	 * so we extract them into array
	 * 
 	 * @param {String} str 
 	 * @returns {Array} with splitted and trimmed values
	 */
	initialSplitMetricString: function(str) {
		str = "" + str;
		var filteredInput = str.replace(/'/g, "");
		var pattern = /=/g;

		var result = filteredInput.split(pattern)
					.filter(function(el, index) {
						return el.trim();
					}, this);

		return result;
	},

	/**
	 * We need to split againg the result from the initialSplitMetricString
	 * 
 	 * @param {Array} array - array with the extracted metrics from extractMetricsFromString function
 	 * @returns {Array} with splitted and trimmed values
	 */
	splitByWhiteSpace: function(array) {
		var result = [];

		if(array instanceof Array && array.length > 0) {
			array.forEach(function(el, index, arr) {
				if((index == 0) || (index == arr.length - 1)) {
					result.push(el);
				} else {
					var firstWhiteSpace = el.indexOf(" ");
					if(firstWhiteSpace > -1) {
						var value = el.substring(0, firstWhiteSpace);
						var key = el.substring(firstWhiteSpace, el.length);
						result.push(value.trim(), key.trim());
					}
				}
			}, this);
		} else {
			this.debug(SOURCE + ": Empty array in splitByWhiteSpace or wrong format");
		}

		return result;
	},

	/**
	 * We need to split againg the result from the splitByWhiteSpace
	 * 
 	 * @param {Array} array - array with the extracted metrics from splitByWhiteSpace function
 	 * @returns {Array} with splitted and trimmed values
	 */
	splitBySemicolon: function(array) {
		var result = [];

		if(array instanceof Array && array.length > 0) {
			array.forEach(function(el, index) {
				if(index % 2 != 0) {
					var separator = el.indexOf(";");
					if(separator > -1) {
						var metricValue = el.substring(0, separator);
						result.push(metricValue);
					} else {
						result.push(el);
					}
				} else {
					result.push(el);
				}
			}, this);
		} else {
			this.debug(SOURCE + ": Empty array in splitBySemicolon or wrong format");
		}

		return result;
	},

	/**
	 * Filling array of object with the splitted metrics
	 * 
 	 * @param {Array} array - array with the extracted metrics from splitBySemicolon function
 	 * @returns {Array} array of objects with the filtered metrics
	 */
	concatInObjects: function(array) {
		var result = [];

		if(array instanceof Array && array.length > 0) {
			for(var i = 0; i < array.length; i++) {
				if(i % 2 == 0) {
					result.push({key: array[i], value: array[i+1]});
				}
			}
		} else {
			this.debug(SOURCE + ": Empty array in concatInObjects or wrong format");
		}

		return result;
	},

	/**
	 * Extracs the metric type from the metric value. For example "123ms" -> value:"123", valueType:"ms"
	 * 
 	 * @param {String} str - string with the metric value
 	 * @returns {Object} object with two attributes -> value and valueType
	 */
	extractTypeFromStr: function(str) {
		var resultObj = {},
			startIndex = str.length,
			length = str.length,
			value,
			valueType;

		for(var i = length - 1; i >= 0; i--) {
			if(isNaN(str[i]) && str[i] != ".") {
				startIndex = i;
			} else {
				break;
			}
		}

		value = str.slice(0, startIndex);
		valueType = str.slice(startIndex, length);
		resultObj.value = value;
		resultObj.valueType = valueType;

		return resultObj;
	},
	
	/**
	 * Logging a message if the additional parameter isDebug is set to be true
	 *
 	 * @param message
	 */
	debug: function(message){
		if (isDebug == true || isDebug == "true"){
			ms.log(SOURCE + ": " + message);
		}

		return true;
	},
	
	type: "NagiosMetrics_JS"
});

NagiosMetrics_JS.get = function(probe){
	ms.log("NagiosMetrics_JS invoked");
	return new NagiosMetrics_JS(probe);
   };
