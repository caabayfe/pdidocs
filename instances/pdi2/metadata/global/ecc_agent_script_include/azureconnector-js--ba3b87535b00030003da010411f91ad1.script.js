var AzureConnector_JS = Class.create();
var RawMetric = Packages.com.service_now.metric.model.RawMetric;

var MetricFactory = Packages.com.service_now.metric.MetricFactory;
var StorageCredentials = Packages.com.microsoft.azure.storage.StorageCredentials;
var StorageException = Packages.com.microsoft.azure.storage.StorageException;
var StringUtil = Packages.com.glide.util.StringUtil;
var SUCCESS = Packages.com.service_now.mid.probe.tpcon.OperationStatusType.SUCCESS;
var FAILURE = Packages.com.service_now.mid.probe.tpcon.OperationStatusType.FAILURE;
var HTTPRequest = Packages.com.glide.communications.HTTPRequest;
var EntityUtils = Packages.org.apache.http.util.EntityUtils;
var METRIC_SOURCE_NAME = "Microsoft Azure Metrics";

var subscriptionId = this.probe.getAdditionalParameter("subscription_id");
var tenantId = this.probe.getCredentialAttribute("tenant_id");
var clientId = this.probe.getCredentialAttribute("client_id");
var clientSecret = this.probe.getCredentialAttribute("secret_key");


var MAX_EVENTS_TO_FETCH = 3000;
var MAX_URL_CHARACTER_SIZE = 1500;
var errorMessage = "";
var runStatus = SUCCESS.toString();

AzureConnector_JS.prototype = Object.extendsObject(AProbe, {
	retrieveKpi: function() {
		try {
			var scriptStartTime = new Date();
			var lastKpiSignature = this.probe.getParameter("last_kpi_signature");
			var maxFetchTime = 60 * 1000 * parseInt(this.probe.getAdditionalParameter("max_fetch_interval_min"));
			var offset = 60 * 1000 * parseInt(this.probe.getAdditionalParameter("offset_min"));
			var lastStartTime = null;
			var retVal = {};
			var startTime = new Date().getTime();
			var metricList;
			var metricCount = 0;
			//For defect DEF0183660, if number of resources is greaterthan 1000, then in resource api response, will get nextLink uri to get next set of resources.
			var nextLinkExists = false;

			if (lastKpiSignature == null || startTime - lastKpiSignature > maxFetchTime) {
				lastStartTime = startTime - maxFetchTime;
				ms.log("No previous fetch or too long ago");
			} else {
				lastStartTime = lastKpiSignature;
			}

			fetchStartTime = new Date(lastStartTime - offset);
			fetchEndTime = new Date(startTime - offset);
			ms.log("fetch start time: " + fetchStartTime.toISOString());
			ms.log("fetch end time: " + fetchEndTime.toISOString());

			var accessToken = this.getAccessToken(tenantId, clientId, clientSecret, "https://management.azure.com/");

			var resourceList = this.getResponseJSON("https://management.azure.com/subscriptions/" + subscriptionId + "/resources?api-version=2017-05-10", accessToken, true);

			if (typeof resourceList.value != 'undefined' && resourceList.value instanceof Array && resourceList.value.length > 0) {
				do {
					if (typeof resourceList.value != 'undefined' && resourceList.value instanceof Array && resourceList.value.length > 0) {
						for (var resourceIndex = 0; resourceIndex < resourceList["value"].length; resourceIndex++) {
							var resourceId = resourceList["value"][resourceIndex]["id"];

							var ciIdentifier = new Packages.java.util.HashMap();
							ciIdentifier.put("id", resourceList["value"][resourceIndex]["id"]);
							ciIdentifier.put("name", resourceList["value"][resourceIndex]["name"]);
							ciIdentifier.put("resource_type", resourceList["value"][resourceIndex]["type"]);
							ciIdentifier.put("location", resourceList["value"][resourceIndex]["location"]);
							ciIdentifier.put("subscriptionId", subscriptionId);

							var metricDefinitionList = this.getResponseJSON(encodeURI("https://management.azure.com" + resourceId + "/providers/microsoft.insights/metricDefinitions?api-version=2016-03-01"), accessToken, false);

							if (typeof metricDefinitionList.value != 'undefined' && metricDefinitionList.value instanceof Array && metricDefinitionList.value.length > 0) {
								metricCount += this.getMetricsForResource(resourceId, metricDefinitionList, fetchStartTime, fetchEndTime, accessToken, ciIdentifier);
							}
						}

						if (resourceList.hasOwnProperty('nextLink')) {
							resourceList = this.getResponseJSON(resourceList.nextLink, accessToken, true);
							ms.log("AzureConnector_JS: As nextLink is present in response, processing nextLink to get other resources");
							nextLinkExists = true;
						} else {
							nextLinkExists = false; //if nextLink doesnt exists then break the do-while loop
						}
					} else {
						nextLinkExists = false; //if nextLink exists but when we go to that link if we dont get any resources or resources is empty, then break the do-while loop
					}
					
				} while (nextLinkExists);  //if nextLink exists then get the next set of resources and their metrics
			} else {
				this.addError("No Resources found for connector. ");
			}
 
			retVal['status']  = "" + runStatus;
			retVal['error_message'] = errorMessage + "";
			ms.log("AzureConnector_JS: STATUS: " + retVal['status']);

			retVal['metric_duration'] = '' + Number((new Date().getTime() - scriptStartTime.getTime()));
			retVal['metric_source'] = METRIC_SOURCE_NAME;
			retVal['metric_count'] = metricCount;
			retVal['last_kpi_signature'] = startTime.toString();
			ms.log("Finished receiving Azure Connector data. Metric count received: " + metricCount);

			return retVal;
		} catch (err) {
			errorMessage = err.message;
		}
	},

	/*
	 * metricDefinitionList is the list of all metric names for that resource
	 */
	getMetricsForResource: function(resourceId, metricDefinitionList, fetchStartTime, fetchEndTime, accessToken, ciIdentifier) {
		var metricCount = 0;
		var currentMetricDefinitionList = []; // the list of all metrics for the resource that are in the current GET request
		var metricDefinitionIndex = 0;
		var uriPostFix = ") and aggregationType eq 'Average' and startTime eq " + fetchStartTime.toISOString() + " and endTime eq " + fetchEndTime.toISOString() + " and timeGrain eq duration'PT1M'";

		var uri = "https://management.azure.com" + resourceId + "/providers/microsoft.insights/metrics?api-version=2016-09-01&$filter=";
		var currentQuerySize = uri.length + 2; // +2 for the '()'
		var filterExpression = "(";

		while (metricDefinitionIndex < metricDefinitionList["value"].length) {
			if ((typeof (metricDefinitionList["value"][metricDefinitionIndex]).name.value) != 'undefined') {
				var newFilterExpression = filterExpression + "name.value eq '" + metricDefinitionList["value"][metricDefinitionIndex]["name"]["value"] + "' or ";

				if (currentQuerySize + uriPostFix.length + newFilterExpression.length < MAX_URL_CHARACTER_SIZE) {
					filterExpression = newFilterExpression;
					currentMetricDefinitionList.push(metricDefinitionList["value"][metricDefinitionIndex]["name"]["value"]);
				} else {
					metricCount += this.processMetricsBatch(resourceId, currentMetricDefinitionList, fetchStartTime, fetchEndTime, accessToken, ciIdentifier, uri, filterExpression, uriPostFix);

					currentMetricDefinitionList = [];
					filterExpression = "(name.value eq '" + metricDefinitionList["value"][metricDefinitionIndex]["name"]["value"] + "' or ";
				}
			}

			metricDefinitionIndex = metricDefinitionIndex + 1;
		}

		if (currentMetricDefinitionList != []) {
			metricCount += this.processMetricsBatch(resourceId, currentMetricDefinitionList, fetchStartTime, fetchEndTime, accessToken, ciIdentifier, uri, filterExpression, uriPostFix);
		}

		return metricCount;
	},

	processMetricsBatch: function(resourceId, currentMetricDefinitionList, fetchStartTime, fetchEndTime, accessToken, ciIdentifier, uri, filterExpression, uriPostFix) {
		var metricCount = 0;
		uri = uri + filterExpression.slice(0, -4) + uriPostFix; // remove the last ' or ' from filterExpression

		var metrics = this.getResponseJSON(encodeURI(uri), accessToken, false);

		if (typeof metrics.code != 'undefined' && metrics["code"] == "BadRequest") {
			// Possibly one or more of the metrics is giving bad data. As a fallback, make a call to get each metric individually.
			metricCount = this.processMetricsIndividually(resourceId, currentMetricDefinitionList, fetchStartTime, fetchEndTime, accessToken, ciIdentifier);
		} else {
			metricCount = this.processMetricData(metrics, ciIdentifier);
		}

		return metricCount;
	},

	processMetricsIndividually : function(resourceId, currentMetricDefinitionList, fetchStartTime, fetchEndTime, accessToken, ciIdentifier) {
		var metricCount = 0;

		for (var metricDefinitionIndex = 0; metricDefinitionIndex < currentMetricDefinitionList.length; metricDefinitionIndex++) {
			uri = this.createUriForSingleMetric(resourceId, currentMetricDefinitionList[metricDefinitionIndex], fetchStartTime, fetchEndTime);
			metrics = this.getResponseJSON(encodeURI(uri), accessToken, false);

			if (typeof metrics.value != 'undefined' && metrics.value instanceof Array && metrics.value.length > 0) {
				metricCount += this.processMetricData(metrics, ciIdentifier);
			}
		}

		return metricCount;
	},

	createUriForSingleMetric: function(resourceId, metricName, fetchStartTime, fetchEndTime) {
		var filterExpression = "(name.value eq '" + metricName + "') and aggregationType eq 'Average' and startTime eq " + fetchStartTime.toISOString() + " and endTime eq " + fetchEndTime.toISOString() + " and timeGrain eq duration'PT1M'";
		var uri = "https://management.azure.com" + resourceId + "/providers/microsoft.insights/metrics?api-version=2016-09-01&$filter=" + filterExpression;

		return uri;
	},

	createUriForAllMetrics: function(resourceId, metricDefinitionList, fetchStartTime, fetchEndTime) {
		var filterExpression = "(";
		
		for (var metricDefinitionIndex = 0; metricDefinitionIndex < metricDefinitionList["value"].length - 1; metricDefinitionIndex++) {
			filterExpression += "name.value eq '" + metricDefinitionList["value"][metricDefinitionIndex]["name"]["value"] + "' or ";
		}

		filterExpression += "name.value eq '" + metricDefinitionList["value"][metricDefinitionList["value"].length-1]["name"]["value"] + "') ";

		filterExpression += "and aggregationType eq 'Average' and startTime eq "+fetchStartTime.toISOString()+" and endTime eq "+fetchEndTime.toISOString()+" and timeGrain eq duration'PT1M'";
		
		var uri = "https://management.azure.com" + resourceId + "/providers/microsoft.insights/metrics?api-version=2016-09-01&$filter=" + filterExpression;

		return uri;
	},

	processMetricData: function(metrics, ciIdentifier) {
		var currentMetricCount = 0;
		var metricHandler = MetricFactory.getMetricHandler();

		for (var metricIndex = 0; metricIndex < metrics["value"].length; metricIndex++) {
			for (var datapointIndex = 0; datapointIndex < (metrics["value"][metricIndex]["data"]).length; datapointIndex++) {
				if (metrics["value"][metricIndex]["data"][datapointIndex]["average"] && metrics["value"][metricIndex]["data"][datapointIndex]["timeStamp"]) {
					var rawMetric = new RawMetric(metrics["value"][metricIndex]["name"]["value"], "", metrics["value"][metricIndex]["data"][datapointIndex]["average"], Date.parse(metrics["value"][metricIndex]["data"][datapointIndex]["timeStamp"].slice(0,-1) + ".000Z"), ciIdentifier, METRIC_SOURCE_NAME);
					try {
						currentMetricCount += 1;
						metricHandler.handleMetric(rawMetric);
					}
					catch (e) {
						ms.log("Got an exception while handling metric: " + rawMetric + " . Exception : " + e);
					}
				}
			}
		}

		return currentMetricCount;
	},

	getMetricDefinitionsList: function(resourceId, accessToken) {
		var query = encodeURI("https://management.azure.com" + resourceId + "/providers/microsoft.insights/metricDefinitions?api-version=2016-09-01");
		var jsonResponse = this.getResponseJSON(query, accessToken, false);
		return jsonResponse;
	},

	//helper method - creates HTTP request and returns the response as JSON string
	getResponseJSON: function(query, accessToken, addToRunStatus) {
		var request = this.createRequest(query);
		request.addHeader('Content-Type', 'application/json');
		request.addHeader('Authorization', 'Bearer ' + accessToken);
		var response = request.get();

		if (response == null) {
			var message = "Null response for the query: " + query + " Error Message: " + request.getErrorMessage();
			if (addToRunStatus) {
				this.addError(message);
				runStatus = "" + FAILURE.toString();
			} else {
				ms.log(message);
			}
			return "";
		}
		else if(response.haveError()){
			var message = "Response for query " + query + " has an error: " + response.getErrorMessage() + ". Full Response body: " + response.getBody();
			if (addToRunStatus) {
				this.addError(message);
				runStatus = "" + FAILURE.toString();
			} else {
				ms.log(message);
			}
			return "";
		}

		var parser = new JSONParser();
		var resultJson =  parser.parse(response.getBody());
		return resultJson;
	},

	getAccessToken: function(tenant_id, client_id, client_secret, resource) {
		var query = "https://login.microsoftonline.com/" + tenant_id + "/oauth2/token";
		var request = this.createRequest(query);

		var params = {
			'grant_type': 'client_credentials',
			'client_id': client_id,
			'client_secret': client_secret,
			'resource': resource
		};

		var response = request.post(params);
		if (response == null) {
			this.addError(request.getErrorMessage());
			return this.parseToJSON(response);
		}

		return JSON.parse(response.getBody())["access_token"];
	},

	getReturnVal: function(errorMessageToReturn) {
		var retVal = {};
		if (StringUtil.notNil(errorMessageToReturn) && errorMessageToReturn !== undefined) {
			retVal['status']  = "" + FAILURE.toString();
			retVal['error_message'] = errorMessageToReturn + "";
			ms.log("AzureConnector_JS: STATUS: ERROR: " + errorMessageToReturn);
		} else {
			retVal['status']  = "" + SUCCESS.toString();
			ms.log("AzureConnector_JS: STATUS: SUCCESS");
		}

		return retVal;
    },

	// test the connection with the target monitor
	testConnection : function() {
		ms.log("Testing Azure Metric Connector credentials");

		var retVal = {};

		try {
			var accessToken = this.getAccessToken(tenantId, clientId, clientSecret, "https://management.azure.com/");
			if (accessToken) {
				retVal['status']  = SUCCESS.toString();
			} else{
				this.addError("Could not get the access token.");
				retVal['status']  = FAILURE.toString();
			}
		} catch (e) {
			this.addError("Found exception trying to get access code: "+ e.toString());
			retVal['status']  = FAILURE.toString();
		}

		return retVal;
	},

	execute: function() {

		ms.log("Connector: execute connection ...");

		var retVal = {};

		retVal['status']  = SUCCESS.toString();

		return retVal;
	},

	createRequest: function(query) {
		var request = new HTTPRequest(query);
		return request;
	},

	addError : function(message){
		if (errorMessage === "")
			errorMessage = message;
		else
			errorMessage += "\n" + message;
		ms.log(errorMessage);
	},


	//helper method - returns the response after parsing it to JSON
	parseToJSON : function (response) {
		var parser = new JSONParser();
		var resultJson =  parser.parse(response.getBody() );
		ms.log("Connector: Found " + resultJson.results.length + " records");
		return resultJson;

	},

type: "AzureConnector_JS"
});
