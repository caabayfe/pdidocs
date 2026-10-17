var AWS_CloudWatch_JS = Class.create();

var SUCCESS = Packages.com.service_now.mid.probe.tpcon.OperationStatusType.SUCCESS;
var FAILURE = Packages.com.service_now.mid.probe.tpcon.OperationStatusType.FAILURE;
var AWSRawMetric = Packages.com.snc.oi.metric.connector.AWSRawMetric;
var AWSMetricConnector = Packages.com.snc.oi.metric.connector.AWSMetricConnector;
var MetricFactory = Packages.com.service_now.metric.MetricFactory;
var RawMetric = Packages.com.service_now.metric.model.RawMetric;
var StringUtil = Packages.com.glide.util.StringUtil;
var regions = this.probe.getAdditionalParameter("regions");
var accountId = this.probe.getAdditionalParameter("account_id");
var accessKey = this.probe.getCredentialAttribute("access_key");
var secretKey = this.probe.getCredentialAttribute("secret_key");

var METRIC_SOURCE_NAME = "AWS CloudWatch Metrics";
var MAX_EVENTS_TO_FETCH = 3000;
var ONE_MINUTE_IN_MILLISECONDS = 60000;
var errorMessage = "";

AWS_CloudWatch_JS.prototype = Object.extendsObject(AProbe, {
	retrieveKpi: function() {
		var scriptStartTime = new Date();
		var period = parseInt(this.probe.getAdditionalParameter("period_sec"));
		var offset = 60 * 1000 * parseInt(this.probe.getAdditionalParameter("offset_min"));
		var maxFetchTime = 60 * 1000 * parseInt(this.probe.getAdditionalParameter("max_fetch_interval_min"));
		var lastKpiSignature = parseInt(this.probe.getParameter("last_kpi_signature"));
		var errorMessageToReturn;
		var fetchStartTime;
		var metricCount;
		var retVal = {};
		var fetchEndTime = this.roundDownToMinute(new Date().getTime()) - offset;
		var metricList;
		try {
			var metricConnector = new AWSMetricConnector(regions, period, accessKey, secretKey, accountId);
			if (lastKpiSignature == null
				|| fetchEndTime - lastKpiSignature > maxFetchTime) {
				fetchStartTime = fetchEndTime - maxFetchTime;
				ms.log("No previous fetch or too long ago");
			} else {
				fetchStartTime = lastKpiSignature;
			}

			ms.log("fetch start time: " + new Date(fetchStartTime));
			ms.log("fetch end time: " + new Date(fetchEndTime));

			var metricHandler = MetricFactory.getMetricHandler();
			metricList = metricConnector.getRawMetrics(fetchStartTime, fetchEndTime);

			if (metricList != null) {
				for(var i =0 ; i < metricList.size(); i++) {
					var rawMetric = this.toRawMetric(metricList.get(i));
					metricHandler.handleMetric(rawMetric);
				}
			}

			ms.log(metricList.size() + " metrics handled");
			
		} catch (err) {
			errorMessageToReturn = err.message;
		}
		retVal = this.getReturnVal(errorMessageToReturn);
		
		retVal['metric_duration'] = '' + Number((new Date().getTime() - scriptStartTime.getTime()));
		retVal['metric_source'] = METRIC_SOURCE_NAME;
		retVal['metric_count'] = metricList.size();
		retVal['last_kpi_signature'] = fetchEndTime.toString();
		return retVal;
	},
	
	toRawMetric: function(awsRawMetric) {
		return new RawMetric(awsRawMetric.getMetricType(), awsRawMetric.getNode(), awsRawMetric.getValue(), awsRawMetric.getTimestamp(), awsRawMetric.getCiIdentifier(), awsRawMetric.getSource());
	},
	
    getReturnVal: function(errorMessageToReturn) {
		var retVal = {};
		if (StringUtil.notNil(errorMessageToReturn) && errorMessageToReturn !== undefined) {
			retVal['status']  = "" + FAILURE.toString();
			retVal['error_message'] = errorMessageToReturn + "";
			ms.log("AWS_CloudWatch_JS: STATUS: ERROR: " + errorMessageToReturn);
		} else {
			retVal['status']  = "" + SUCCESS.toString();
			ms.log("AWS_CloudWatch_JS: STATUS: SUCCESS");
		}
		
		return retVal;
    },
	
	roundDownToMinute: function(timeInMilli) {
		return 60000.0*Math.floor(timeInMilli/60000.0);
	},
	
	// test the connection with the target monitor
	testConnection : function() {
		
		ms.log("Connector testing connection");
		
		var retVal = {};
		var errorMsg = "";

		if (StringUtil.nil(regions)) {
			errorMsg = "Regions field is empty.";
			this.addError(errorMsg);
			retVal['error_message'] = errorMsg;
			retVal['status'] = FAILURE.toString();
			return retVal;
		}
		if (StringUtil.nil(accountId)) {
			errorMsg = "AccountId field is empty.";
			this.addError(errorMsg);
			retVal['error_message'] = errorMsg;
			retVal['status'] = FAILURE.toString();
			return retVal;
		}

		try {
			var metricConnector = new AWSMetricConnector(regions, 300, accessKey, secretKey, accountId);
			
			var startTime = Date.now().toString();
			var endTime = new Date(Date.now() + ONE_MINUTE_IN_MILLISECONDS).getTime().toString();

			if (metricConnector.testRawMetrics(startTime, endTime)){
				retVal['status']  = SUCCESS.toString();
			} else{
				errorMsg = "No metrics were retrieved from AWS.";
				this.addError(errorMsg);
				retVal['error_message'] = errorMsg;
				retVal['status']  = FAILURE.toString();
			}
		
		} catch (e) {
			this.addError(e.toString());
			retVal['status'] = FAILURE.toString();
		}
		
		ms.log("Connector testConnection " + retVal['status'] );
		retVal = this.getReturnVal(errorMessage);
		return retVal;
	},

	execute: function() {
		
		ms.log("Connector: execute connection ...");
		
		var retVal = {};
		
		retVal['status'] = SUCCESS.toString();
			
		return retVal;
	},

	addError : function(message){
		if (errorMessage === "")
			errorMessage = message;
		else
			errorMessage += "\n" + message;
		ms.log(message);
	},
		
type: "AWS_CloudWatch_JS"
});
