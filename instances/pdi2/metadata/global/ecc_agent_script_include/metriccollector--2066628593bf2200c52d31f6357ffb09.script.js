var MetricCollector = Class.create();

var SUCCESS = Packages.com.service_now.mid.probe.tpcon.OperationStatusType.SUCCESS;
var FAILURE = Packages.com.service_now.mid.probe.tpcon.OperationStatusType.FAILURE;
var MetricFactory = Packages.com.service_now.metric.MetricFactory;
var StringUtil = Packages.com.glide.util.StringUtil;
var LoggerFactory = Packages.com.snc.core_automation_common.logging.LoggerFactory;
var HandleTypesProvider = Packages.com.service_now.metric.registration.HandleTypesProvider;
var RawMetric = Packages.com.service_now.metric.model.RawMetric;
var Config = Packages.com.service_now.mid.services.Config;
var MIDConfigParameter = Packages.com.snc.commons.MIDConfigParameter;
var Connection =  Packages.java.sql.Connection;
var DriverManager = Packages.java.sql.DriverManager;
var ResultSet = Packages.java.sql.ResultSet;
var SQLException = Packages.java.sql.SQLException;
var Statement = Packages.java.sql.Statement;
var SimpleDateFormat = Packages.java.text.SimpleDateFormat;
var TimeZone = Packages.java.util.TimeZone;
var Calendar = Packages.java.util.Calendar;
var islogPayloadForDebug = false;


var myMidServerDebugMode = 0;
var lastMetricTime;
var nowCalendar = Calendar.getInstance(TimeZone.getTimeZone("GMT"));

MetricCollector.prototype = Object.extendsObject(AProbe, {
  initialize: function(probe) {
	  this.probe = probe;
   },

	retrieveKpi: function() {
		var errorMessageToReturn = "";
		var host =  this.probe.getParameter("host");
		var startTime = new Date();
		var metric_fetching_time_seconds = Config.get().getIntProperty(MIDConfigParameter.METRIC_CONNECTOR_MAX_RUN_TIME_SECONDS, 300);

		var metric_time_pass = Config.get().getIntProperty(MIDConfigParameter.METRIC_CONNECTOR_HISTORY_MIN, 180); // fetch metrics no more then 180 (difault) minutes back
		var metric_time_pass_seconds = metric_time_pass * 60;
	    // Number of seconds of delay when collecting metrics
		var LateArrivalsDelay = Config.get().getIntProperty(MIDConfigParameter.METRIC_CONNECTOR_LATE_ARRIVALS_DELAY, 30);
		var isDebug = LoggerFactory.getLoggerForName("MetricCollector").isDebugEnabled() + "";

		if(isDebug == "true") {
			 myMidServerDebugMode = 1;
		} else {
			 myMidServerDebugMode = 0;
		}
	    islogPayloadForDebug = "" + this.probe.getAdditionalParameter("logPayloadForDebug");
		this.lastMetricTime =  this.probe.getParameter("last_kpi_signature");
		this.debugLog("MetricCollector: metric_fetching_time_seconds (METRIC_CONNECTOR_MAX_RUN_TIME_SECONDS parameter) = " + metric_fetching_time_seconds);
		this.debugLog("MetricCollector: metric_time_pass (METRIC_CONNECTOR_HISTORY_MIN parameter) = " + metric_time_pass);
		this.debugLog("MetricCollector: LateArrivalsDelay: " + LateArrivalsDelay);
	    this.lastMetricTime = this.getLastMetricSignature(this.lastMetricTime, metric_time_pass_seconds);
		this.lastMetricTime = parseInt(this.lastMetricTime);
		this.debugLog("MetricCollector: start fetching from : " + new Date(this.lastMetricTime));

		var metricHandler   = MetricFactory.getMetricHandler();
		var conn;
		var statement;
		var rs;
		var totalNumberOfMetricRecords = 0;
		try {
			Class.forName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
			var databaseUserName = this.probe.getParameter("database_username");
		    var databasePassword = this.probe.getParameter("database_password");
			var databasePort = this.probe.getParameter("database_port");
			var instanceName = this.probe.getParameter("instanceName");
			if(!databasePort)
				databasePort = 1433;

		    var jdbcURL;
		    if(databaseUserName || databasePassword) {
				this.debugLog("MetricCollector: connecting with local database user");
				jdbcURL = this.getJDBCUrl(false, host, databasePort, instanceName);
				conn = DriverManager.getConnection(jdbcURL, databaseUserName, databasePassword);
			} else {
				this.debugLog("MetricCollector: connecting with Windows Authentication");
				jdbcURL = this.getJDBCUrl(true, host, databasePort, instanceName);
				conn = DriverManager.getConnection(jdbcURL);
			}
			statement = conn.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);
		    statement.setFetchSize(5000);

	        var metricRetrieveChunkSize = this.getParamValue("metric_chunk_size", "50000");
	        if(StringUtil.nil(metricRetrieveChunkSize) || !StringUtil.isNumeric(metricRetrieveChunkSize)) {
				ms.log("MetricCollector: metricRetrieveChunkSize: incorrect value " + metricRetrieveChunkSize + " setting to default: 50000");
				metricRetrieveChunkSize = 50000; //default
			}
	        var lateArrivalsDelayMill = LateArrivalsDelay * 1000;
	        var SQLCommand = this.getSQLCommand(lateArrivalsDelayMill, metricRetrieveChunkSize);

		    rs = statement.executeQuery(SQLCommand);
		     numberOfRecords = 0;
		     var startLoopTime = new Date();
	         while (rs.next()) {
	    		 var rawMetric = this.getRawMatric(rs);
	    		 metricHandler.handleMetric(rawMetric);
	        	 totalNumberOfMetricRecords++;
	        	 numberOfRecords++;
		         if(rs.isLast()) {
		         	var duration = Number((new Date().getTime() - startLoopTime.getTime()) / 1000).toFixed(3);
		         	if(duration > 0)
		             	this.debugLog("MetricCollector (PERF) handle " + numberOfRecords + " metrics in " + duration + " seconds (" + Number(numberOfRecords/duration).toFixed(3) + " per second)");
		        	 if(numberOfRecords < 1000) // No need to query again
		        	 	break;
		        	 if((new Date().getTime() - startTime.getTime()) / 1000 > metric_fetching_time_seconds) { // metric_fetching_time_seconds pass, we need to break
						ms.log("MetricCollector: metric_fetching_time_seconds (" + metric_fetching_time_seconds + " seconds) pass, exiting");
						break;
					 }
		        	 SQLCommand = this.getSQLCommand(lateArrivalsDelayMill, metricRetrieveChunkSize);
			         rs = statement.executeQuery(SQLCommand);
		             startLoopTime = new Date();
		             numberOfRecords = 0;
		         }
	         }
	     } catch (err) {
	     	errorMessageToReturn = err.message;
	     } finally {
			 try { if (conn) conn.close(); } catch ( e) {}
			 try { if (rs) rs.close(); } catch ( e) {}
			 try { if (statement) statement.close(); } catch ( e) {}
	     }

        totalDuration = Number((new Date().getTime() - startTime.getTime()));
		var totalDurationSec = (totalDuration / 1000).toFixed(3);
		if(totalNumberOfMetricRecords > 0 && totalDurationSec > 0)
				ms.log("MetricCollector (PERF) handle total of " + totalNumberOfMetricRecords + " metrics in " + totalDurationSec + " seconds (" + Number(totalNumberOfMetricRecords/totalDurationSec).toFixed(3) + " per second)");

		retVal = this.getReturnVal(errorMessageToReturn);
		retVal['last_kpi_signature']  = "" + this.lastMetricTime;
		retVal['metric_source']  = "" + "SCOM";
		if(totalNumberOfMetricRecords > 0) {
			retVal['metric_count']  = "" + totalNumberOfMetricRecords;
			retVal['metric_duration']  = "" + totalDuration;
		}

 	return retVal;
   },

   getJDBCUrl: function(useWindowsAuthentication, host, databasePort, instanceName) {
	   var jdbcURL;

	   if(useWindowsAuthentication)
			jdbcURL = "jdbc:sqlserver://" + host + ";DatabaseName=OperationsManagerDW;integratedSecurity=true";
	   else
			jdbcURL = "jdbc:sqlserver://" + host + ";DatabaseName=OperationsManagerDW";

	   if(StringUtil.notNil(instanceName))
			jdbcURL = jdbcURL + ";instanceName=" + instanceName;
	   else
		   jdbcURL = jdbcURL + ";port=" + databasePort;
	   this.debugLog("MetricCollector: JDBC URL: " + jdbcURL);

	   return jdbcURL;
   },

	getLastMetricSignature: function(lastMetricSignature, metric_time_pass_seconds) {

	 	var now =  new Date().getTime();
	 	if(StringUtil.nil(lastMetricSignature)) {
			// lastMetricSignature is empty, we will start to retrieved from now - metric_time_pass_seconds
			lastMetricSignature = 0;
			ms.log("MetricCollector: last_kpi_signature was empty");
	  	}

		if(lastMetricSignature > now) {
			// lastMetricSignature highr then now, this should not happen
			lastMetricSignature = 0;
			ms.log("MetricCollector: Warning: last_kpi_signature is highr then now, setting to 0");
	  	}

		var passTimeSeconds = (now - lastMetricSignature) /1000;
		if(passTimeSeconds > metric_time_pass_seconds) {
			// Too long time pass from the last retrieve time. (now - metric_time_pass_seconds)
			lastMetricSignatureDate = new Date(now - (metric_time_pass_seconds * 1000));
			lastMetricSignature = lastMetricSignatureDate.getTime();
			ms.log("MetricCollector: A long period of time has elapsed since last retrieve metric time (" + Number(passTimeSeconds / 60).toFixed(3) + " minutes). Setting lastMetricSignature to " + lastMetricSignatureDate);
	 	}

	  	if(lastMetricSignature == 0)
	  		lastMetricSignature =  new Date().getTime();

        this.debugLog("SCOMMetricCollector: LastMetricSignature: " + lastMetricSignature);
	  	return lastMetricSignature + "";
    },

	getTypes: function() {
		var HandleTypes     = HandleTypesProvider.getMetrictTypeHandler();
		var typesFromCache = HandleTypes.getActiveTypesForSql("SCOM");
		return typesFromCache + "";

	},

	// Get return val
    getReturnVal: function(errorMessageToReturn) {
		var retVal = {};
		if (StringUtil.notNil(errorMessageToReturn) && errorMessageToReturn != 'undefined') {
			retVal['status']  = "" + FAILURE.toString();
			retVal['error_message'] = errorMessageToReturn + "";
			ms.log("MetricCollector: STATUS: ERROR: " + errorMessageToReturn);
		} else {
			retVal['status']  = "" + SUCCESS.toString();
			ms.log("MetricCollector: STATUS: SUCCESS");
		}

		return retVal;
    },

	getSQLCommand: function(lateArrivalsDelayMill, metricRetrieveChunkSize) {
		var sqlCommand = "SELECT top " + metricRetrieveChunkSize + " rd.DateTime 'metricTime',pr.CounterName 'metricType',AVG(SampleValue) 'metricValue',me.Path, me.FullName,"
				+ " mt.ManagedEntityTypeSystemName 'metricMonitoredObjectType', pin.InstanceName, pr.ObjectName " +
				"FROM Perf.vPerfRaw rd, vManagedEntity me, vPerformanceRuleInstance pin, vPerformanceRule pr, vManagedEntityType mt " +
				"WHERE rd.ManagedEntityRowId = me.ManagedEntityRowId and rd.PerformanceRuleInstanceRowId = pin.PerformanceRuleInstanceRowId " +
				"and pin.RuleRowId =  pr.RuleRowId and mt.ManagedEntityTypeRowId = me.ManagedEntityTypeRowId ";

		var activeTypes = this.getTypes();
		if(activeTypes) {
			sqlCommand = sqlCommand + " and pr.CounterName in(" + activeTypes + ")";
		}
		var startDate = this.formatDate(this.lastMetricTime);
		var convertStartTime = "CONVERT(DATETIME, "+ "'" + startDate + "',121)";
		var endDate = this.formatDate(new Date().getTime() - lateArrivalsDelayMill);
		var convertEndTime = "CONVERT(DATETIME, "+ "'" + endDate + "',121)";

		this.debugLog("MetricCollector: SQL command startDate: " + startDate + " SQL command end: "  + endDate);
		sqlCommand = sqlCommand + " and rd.DateTime > " + convertStartTime  + " and rd.DateTime < " +  convertEndTime +
				" group by rd.DateTime, pr.CounterName, me.Path, me.FullName, mt.ManagedEntityTypeSystemName, pin.InstanceName, pr.ObjectName" +
				" order by rd.DateTime" ;

		this.debugLog("MetricCollector: SQL command: " + sqlCommand);
		return sqlCommand;
    },

	getRawMatric: function(rs) {
		var metricType = rs.getString("metricType");
		var metricValue = rs.getFloat("metricValue");
		var metricCreateTime = rs.getTimestamp("metricTime", nowCalendar);

		var path = rs.getString("Path");
		var host = this.getNode(path);

		this.lastMetricTime = metricCreateTime.getTime();
		var ciFullName = rs.getString("FullName");
		var resource = "";
		if(StringUtil.notNil(ciFullName) ){
			// Get the resource name
			var afterNodeIndex = ciFullName.lastIndexOf(";");
			if (afterNodeIndex > -1)
				resource = ciFullName.substring(afterNodeIndex + 1, ciFullName.length());
		}

		if(StringUtil.nil(resource)) {
			// If there is no resource, fill the host name
			resource = host;
			if(StringUtil.nil(resource)) {
				// If there is no host, fill the ciFullName (which should contain the resource type in this case)
				resource = ciFullName;
			}
		}


		var instanceName = rs.getString("InstanceName");
		var objectName = rs.getString("ObjectName");
		var metricMonitoredObjectType = rs.getString("metricMonitoredObjectType");
		var ci_identifier = {"MonitoringObjectFullName": ciFullName, "InstanceName": instanceName, "ObjectName": objectName};
        var emsName =  this.probe.getParameter("connector_name");
		var rawMetric = new RawMetric(metricType, null, resource, host, null, metricValue, metricCreateTime.getTime(), ci_identifier, "SCOM", emsName, metricMonitoredObjectType);

		this.logPayload("MetricCollector: Raw Metrics: metricType: " + metricType + " ;metricValue: " + metricValue + " ;metricCreateTime: " + metricCreateTime + "; path: " + path + "; host: " + host + "; ciFullName: " + ciFullName + " ;metricMonitoredObjectType: " + metricMonitoredObjectType + " ;objectName: " + objectName + "; instanceName: " + instanceName + "; ci_identifier: " + ci_identifier);

		if(rs.isLast()) {
			var metricCreateTimeUTC = rs.getTimestamp("metricTime");
			this.debugLog("MetricCollector: last received record. metricTime: " + metricCreateTimeUTC + " ;metricType: " + metricType + " ;metricValue: " + metricValue + "; path: " + path + " ;ciFullName: " + ciFullName + " ;metricMonitoredObjectType: " + metricMonitoredObjectType + " ;objectName: " + objectName);
		}

		return rawMetric;
	},

	getNode: function(path)
	{
		if (StringUtil.nil(path))
			return null;

		var index = path.indexOf(";");
		if(index > 0)
			node = path.substring(0, index);
		else
			node = path;

		return node;
	},

	formatDate: function(timeInMilliseconds) {
		var pattern = "yyyy/MM/dd HH:mm:ss.SSS";

		var format = new SimpleDateFormat(pattern);
		format.setTimeZone(TimeZone.getTimeZone("GMT"));

	    var lastMetricDate = new Date(timeInMilliseconds);
	    var dateFormat = format.format(lastMetricDate);

	    return dateFormat;
	},

	// log debug messages (we need this function as ms.debug function does not exists)
    debugLog: function(message) {
		if(myMidServerDebugMode == 1)
			ms.log(message);
    },
    logPayload: function(msz){
        if (islogPayloadForDebug == true || islogPayloadForDebug == "true" ){
            ms.log(msz);
        }
    },

	getParamValue: function (paramName, defaultValue) {
		var param = this.probe.getAdditionalParameter(paramName);
		if (StringUtil.nil(param))
			param = defaultValue;
		return param;
	},
	
	type: "MetricCollector"
});

MetricCollector.get = function(probe){
	return new MetricCollector(probe);
};
