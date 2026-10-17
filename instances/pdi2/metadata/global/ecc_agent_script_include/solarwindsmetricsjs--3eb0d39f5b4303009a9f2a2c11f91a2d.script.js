var SolarWindsMetricsJS = Class.create();
var SUCCESS = Packages.com.service_now.mid.probe.tpcon.OperationStatusType.SUCCESS;
var FAILURE = Packages.com.service_now.mid.probe.tpcon.OperationStatusType.FAILURE;
var HTTPRequest = Packages.com.glide.communications.HTTPRequest;
var MetricFactory = Packages.com.service_now.metric.MetricFactory;
var RawMetric = Packages.com.service_now.metric.model.RawMetric;
var HandleTypesProvider = Packages.com.service_now.metric.registration.HandleTypesProvider;
var SimpleDateFormat = Packages.java.text.SimpleDateFormat;
var StringUtil = Packages.com.glide.util.StringUtil;
var SOURCE = "SolarWinds";
var CPU_AND_MEMORY_TABLE_NAME = "Orion.CPULoad";
var INTERFACE_TRAFFIC_TABLE_NAME = "Orion.NPM.InterfaceTraffic";
var RESPONSE_TIME_TABLE_NAME = "Orion.ResponseTime";
var VOLUME_USAGE_TABLE_NAME = "Orion.VolumeUsageHistory";
var VOLUME_PERFORMANCE_TABLE_NAME = "Orion.VolumePerformanceHistory";
var CPU_AND_MEMORY = "cpuAndMemory";
var INTERFACE_TRAFFIC = "interfaceTraffic";
var RESPONSE_TIME = "responseTime";
var VOLUME_USAGE = "volumeUsage";
var VOLUME_PERFORMANCE = "volumePerformance";
var NOW_OFFSET = 0;
var LAST_METRIC_TIME = 0;
var DEFAULT_MAX_FETCH_INTERVAL_MIN = 180;
var now = new Date();
var nowUTC = new Date(now.getUTCFullYear(),now.getUTCMonth(), now.getUTCDate() , now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
var metricCounter = 0;
var errorMessage = "";
var isDebug = false;
var isDebugResponsе;
var islogPayloadForDebug = false;
var queryForDebug = "";
var secondsSinceLastFetch;
var startDate = 0;
var JSONparser = new JSON();
var max_fetch = 5000;
// Keeps everything out of the retrieveKpi function for better readability
var allAttributesObj = {
	cpuAndMemory: 	[	
						{field: "A.Node.Vendor", name: "Node_Vendor"},
						{field: "A.Node.NodeID" , name: "Node_NodeID"},
						{field: "A.Node.NodeName" , name: "Node_NodeName"},
						{field: "A.Node.SysName" , name: "Node_SysName"},
						{field: "A.Node.IPAddressType" , name: "Node_IPAddressType"},
						{field: "A.Node.IPAddress" , name: "Node_IPAddress"},
						{field: "A.Node.DNS" , name: "Node_DNS"},
						{field: "A.Node.MachineType" , name: "Node_MachineType"},
						{field: "A.Node.IOSVersion" , name: "Node_IOSVersion"},
						{field: "A.Node.Location" , name: "Node_Location"},
						{field: "A.Node.Caption" , name: "Node_Caption"},
						{attribute: "InstanceType"},
						{attribute: "DateTime"},
						{metric: "MinLoad"},
						{metric: "MaxLoad"},
						{metric: "AvgLoad"},
						{metric: "MinMemoryUsed"},
						{metric: "MaxMemoryUsed"},
						{metric: "AvgMemoryUsed"},
						{metric: "AvgPercentMemoryUsed"}
					],
	interfaceTraffic:[
						{field: "A.Interface.Node.Vendor" , name: "Node_Vendor"},
						{field: "A.Interface.Node.NodeID" , name: "Node_NodeID"},
						{field: "A.Interface.Node.NodeName" , name: "Node_NodeName"},
						{field: "A.Interface.Node.SysName" , name: "Node_SysName"},
						{field: "A.Interface.Node.IPAddressType" , name: "Node_IPAddressType"},
						{field: "A.Interface.Node.IPAddress" , name: "Node_IPAddress"},
						{field: "A.Interface.Node.DNS" , name: "Node_DNS"},
						{field: "A.Interface.Node.MachineType" , name: "Node_MachineType"},
						{field: "A.Interface.Node.IOSVersion" , name: "Node_IOSVersion"},
						{field: "A.Interface.Node.Location" , name: "Node_Location"},
						{field: "A.Interface.Node.Caption" , name: "Node_Caption"},
						{field: "A.Interface.MAC" , name: "Interface_MAC"},
						{field: "A.Interface.PhysicalAddress" , name: "Interface_PhysicalAddress"},
						{field: "A.Interface.Alias" , name: "Interface_Alias"},
						{field: "A.Interface.Name" , name: "Interface_Name"},
						{field: "A.Interface.InterfaceName" , name: "Interface_InterfaceName"},
						{field: "A.Interface.InterfaceID" , name: "Interface_InterfaceID"},
						{field: "A.Interface.InterfaceCaption" , name: "Interface_InterfaceCaption"},
						{field: "A.Interface.InterfaceTypeDescription" , name: "Interface_InterfaceTypeDescription"},
						{attribute: "InstanceType"},
						{attribute: "DateTime"},
						{metric: "InAveragebps"},
						{metric: "InMinbps"},
						{metric: "InMaxbps"},
						{metric: "InTotalBytes"},
						{metric: "InTotalPkts"},
						{metric: "InAvgUniCastPkts"},
						{metric: "InMinUniCastPkts"},
						{metric: "InMaxUniCastPkts"},
						{metric: "InAvgMultiCastPkts"},
						{metric: "InMinMultiCastPkts"},
						{metric: "InMaxMultiCastPkts"},
						{metric: "OutAveragebps"},
						{metric: "OutMinbps"},
						{metric: "OutMaxbps"},
						{metric: "OutTotalBytes"},
						{metric: "OutTotalPkts"},
						{metric: "OutAvgUniCastPkts"},
						{metric: "OutMaxUniCastPkts"},
						{metric: "OutMinUniCastPkts"},
						{metric: "OutAvgMultiCastPkts"},
						{metric: "OutMinMultiCastPkts"},
						{metric: "OutMaxMultiCastPkts"}
					],
	responseTime: [
						{field: "A.Node.Vendor" , name: "Node_Vendor"},
						{field: "A.Node.NodeID" , name: "Node_NodeID"},
						{field: "A.Node.NodeName" , name: "Node_NodeName"},
						{field: "A.Node.SysName" , name: "Node_SysName"},
						{field: "A.Node.IPAddressType" , name: "Node_IPAddressType"},
						{field: "A.Node.IPAddress" , name: "Node_IPAddress"},
						{field: "A.Node.DNS" , name: "Node_DNS"},
						{field: "A.Node.MachineType" , name: "Node_MachineType"},
						{field: "A.Node.IOSVersion" , name: "Node_IOSVersion"},
						{field: "A.Node.Location" , name: "Node_Location"},
						{field: "A.Node.Caption" , name: "Node_Caption"},
						{attribute: "InstanceType"},
						{attribute: "DateTime"},
						{metric: "AvgResponseTime"},
						{metric: "MinResponseTime"},
						{metric: "MaxResponseTime"},
						{metric: "PercentLoss"},
						{metric: "PercentDown"},
						{metric: "Availability"}
				  ],
	volumeUsage: [
						{field: "A.Volume.Node.Vendor" , name: "Node_Vendor"},
						{field: "A.Volume.Node.NodeID" , name: "Node_NodeID"},
						{field: "A.Volume.Node.NodeName" , name: "Node_NodeName"},
						{field: "A.Volume.Node.SysName" , name: "Node_SysName"},
						{field: "A.Volume.Node.IPAddressType" , name: "Node_IPAddressType"},
						{field: "A.Volume.Node.IPAddress" , name: "Node_IPAddress"},
						{field: "A.Volume.Node.DNS" , name: "Node_DNS"},
						{field: "A.Volume.Node.MachineType" , name: "Node_MachineType"},
						{field: "A.Volume.Node.IOSVersion" , name: "Node_IOSVersion"},
						{field: "A.Volume.Node.Location" , name: "Node_Location"},
						{field: "A.Volume.Node.Caption" , name: "Node_Caption"},
						{field: "A.Volume.VolumeID" , name: "Volume_VolumeID"},
						{field: "A.Volume.Caption" , name: "Volume_Caption"},
						{field: "A.Volume.Type" , name: "Volume_Type"},
						{field: "A.Volume.DeviceId" , name: "Volume_DeviceId"},
						{attribute: "InstanceType"},
						{attribute: "DateTime"},
						{metric: "DiskSize"},
						{metric: "AvgDiskUsed"},
						{metric: "MinDiskUsed"},
						{metric: "MaxDiskUsed"},
						{metric: "PercentDiskUsed"},
						{metric: "AllocationFailures"}
				 ],
	volumePerformance: [
						{field: "A.Volume.Node.Vendor" , name: "Node_Vendor"},
						{field: "A.Volume.Node.NodeID" , name: "Node_NodeID"},
						{field: "A.Volume.Node.NodeName" , name: "Node_NodeName"},
						{field: "A.Volume.Node.SysName" , name: "Node_SysName"},
						{field: "A.Volume.Node.IPAddressType" , name: "Node_IPAddressType"},
						{field: "A.Volume.Node.IPAddress" , name: "Node_IPAddress"},
						{field: "A.Volume.Node.DNS" , name: "Node_DNS"},
						{field: "A.Volume.Node.MachineType" , name: "Node_MachineType"},
						{field: "A.Volume.Node.IOSVersion" , name: "Node_IOSVersion"},
						{field: "A.Volume.Node.Location" , name: "Node_Location"},
						{field: "A.Volume.Node.Caption" , name: "Node_Caption"},
						{field: "A.Volume.VolumeID" , name: "Volume_VolumeID"},
						{field: "A.Volume.Caption" , name: "Volume_Caption"},
						{field: "A.Volume.Type" , name: "Volume_Type"},
						{field: "A.Volume.DeviceId" , name: "Volume_DeviceId"},
						{attribute: "InstanceType"},
						{attribute: "VolumeID"},
						{attribute: "DateTime"},
						{metric: "AvgDiskQueueLength"},
						{metric: "MinDiskQueueLength"},
						{metric: "MaxDiskQueueLength"},
						{metric: "AvgDiskTransfer"},
						{metric: "MinDiskTransfer"},
						{metric: "MaxDiskTransfer"},
						{metric: "AvgDiskReads"},
						{metric: "MinDiskReads"},
						{metric: "MaxDiskReads"},
						{metric: "AvgDiskWrites"},
						{metric: "MinDiskWrites"},
						{metric: "MaxDiskWrites"}
						]	
};
var allDefaultAttributeObj = {
	cpuAndMemory:[
						{field: "A.Node.Vendor", name: "Node_Vendor"},
						{field: "A.Node.NodeID" , name: "Node_NodeID"},
						{field: "A.Node.NodeName" , name: "Node_NodeName"},
						{field: "A.Node.SysName" , name: "Node_SysName"},
						{field: "A.Node.IPAddressType" , name: "Node_IPAddressType"},
						{field: "A.Node.IPAddress" , name: "Node_IPAddress"},
						{field: "A.Node.DNS" , name: "Node_DNS"},
						{field: "A.Node.MachineType" , name: "Node_MachineType"},
						{field: "A.Node.IOSVersion" , name: "Node_IOSVersion"},
						{field: "A.Node.Location" , name: "Node_Location"},
						{field: "A.Node.Caption" , name: "Node_Caption"},
						{attribute: "InstanceType"},
						{attribute: "DateTime"}
				 ],
	interfaceTraffic: [
						{field: "A.Interface.Node.Vendor" , name: "Node_Vendor"},
						{field: "A.Interface.Node.NodeID" , name: "Node_NodeID"},
						{field: "A.Interface.Node.NodeName" , name: "Node_NodeName"},
						{field: "A.Interface.Node.SysName" , name: "Node_SysName"},
						{field: "A.Interface.Node.IPAddressType" , name: "Node_IPAddressType"},
						{field: "A.Interface.Node.IPAddress" , name: "Node_IPAddress"},
						{field: "A.Interface.Node.DNS" , name: "Node_DNS"},
						{field: "A.Interface.Node.MachineType" , name: "Node_MachineType"},
						{field: "A.Interface.Node.IOSVersion" , name: "Node_IOSVersion"},
						{field: "A.Interface.Node.Location" , name: "Node_Location"},
						{field: "A.Interface.Node.Caption" , name: "Node_Caption"},
						{field: "A.Interface.MAC" , name: "Interface_MAC"},
						{field: "A.Interface.PhysicalAddress" , name: "Interface_PhysicalAddress"},
						{field: "A.Interface.Alias" , name: "Interface_Alias"},
						{field: "A.Interface.Name" , name: "Interface_Name"},
						{field: "A.Interface.InterfaceName" , name: "Interface_InterfaceName"},
						{field: "A.Interface.InterfaceID" , name: "Interface_InterfaceID"},
						{field: "A.Interface.InterfaceCaption" , name: "Interface_InterfaceCaption"},
						{field: "A.Interface.InterfaceTypeDescription" , name: "Interface_InterfaceTypeDescription"},
						{attribute: "InstanceType"},
						{attribute: "DateTime"}
					  ],
	responseTime: [
						{field: "A.Node.Vendor" , name: "Node_Vendor"},
						{field: "A.Node.NodeID" , name: "Node_NodeID"},
						{field: "A.Node.NodeName" , name: "Node_NodeName"},
						{field: "A.Node.SysName" , name: "Node_SysName"},
						{field: "A.Node.IPAddressType" , name: "Node_IPAddressType"},
						{field: "A.Node.IPAddress" , name: "Node_IPAddress"},
						{field: "A.Node.DNS" , name: "Node_DNS"},
						{field: "A.Node.MachineType" , name: "Node_MachineType"},
						{field: "A.Node.IOSVersion" , name: "Node_IOSVersion"},
						{field: "A.Node.Location" , name: "Node_Location"},
						{field: "A.Node.Caption" , name: "Node_Caption"},
						{attribute: "InstanceType"},
						{attribute: "DateTime"},
				  ],
	volumeUsage: [
						{field: "A.Volume.Node.Vendor" , name: "Node_Vendor"},
						{field: "A.Volume.Node.NodeID" , name: "Node_NodeID"},
						{field: "A.Volume.Node.NodeName" , name: "Node_NodeName"},
						{field: "A.Volume.Node.SysName" , name: "Node_SysName"},
						{field: "A.Volume.Node.IPAddressType" , name: "Node_IPAddressType"},
						{field: "A.Volume.Node.IPAddress" , name: "Node_IPAddress"},
						{field: "A.Volume.Node.DNS" , name: "Node_DNS"},
						{field: "A.Volume.Node.MachineType" , name: "Node_MachineType"},
						{field: "A.Volume.Node.IOSVersion" , name: "Node_IOSVersion"},
						{field: "A.Volume.Node.Location" , name: "Node_Location"},
						{field: "A.Volume.Node.Caption" , name: "Node_Caption"},
						{field: "A.Volume.VolumeID" , name: "Volume_VolumeID"},
						{field: "A.Volume.Caption" , name: "Volume_Caption"},
						{field: "A.Volume.Type" , name: "Volume_Type"},
						{field: "A.Volume.DeviceId" , name: "Volume_DeviceId"},
						{attribute: "InstanceType"},
						{attribute: "DateTime"}
				 ],
	volumePerformance:[	
						{field: "A.Volume.Node.Vendor" , name: "Node_Vendor"},
						{field: "A.Volume.Node.NodeID" , name: "Node_NodeID"},
						{field: "A.Volume.Node.NodeName" , name: "Node_NodeName"},
						{field: "A.Volume.Node.SysName" , name: "Node_SysName"},
						{field: "A.Volume.Node.IPAddressType" , name: "Node_IPAddressType"},
						{field: "A.Volume.Node.IPAddress" , name: "Node_IPAddress"},
						{field: "A.Volume.Node.DNS" , name: "Node_DNS"},
						{field: "A.Volume.Node.MachineType" , name: "Node_MachineType"},
						{field: "A.Volume.Node.IOSVersion" , name: "Node_IOSVersion"},
						{field: "A.Volume.Node.Location" , name: "Node_Location"},
						{field: "A.Volume.Node.Caption" , name: "Node_Caption"},
						{field: "A.Volume.VolumeID" , name: "Volume_VolumeID"},
						{field: "A.Volume.Caption" , name: "Volume_Caption"},
						{field: "A.Volume.Type" , name: "Volume_Type"},
						{field: "A.Volume.DeviceId" , name: "Volume_DeviceId"},
						{attribute: "InstanceType"},
						{attribute: "VolumeID"},
						{attribute: "DateTime"}
					]
};
// All the metrics for all types.
// We are using this object for filtering the metrics from allActiveTypesString. Checklist
var allMetricsObj = {
	cpuAndMemory:["MinLoad", "MaxLoad", "AvgLoad", "MinMemoryUsed", "MaxMemoryUsed", 
	 				"AvgMemoryUsed", "AvgPercentMemoryUsed"],
	interfaceTraffic: ["InAveragebps", "InMinbps", "InMaxbps", "InTotalBytes", "InTotalPkts", 
	"InAvgUniCastPkts", "InMinUniCastPkts", "InMaxUniCastPkts", "InAvgMultiCastPkts", 
	"InMinMultiCastPkts", "InMaxMultiCastPkts", "OutAveragebps", "OutMinbps", "OutMaxbps", 
	"OutTotalBytes", "OutTotalPkts", "OutAvgUniCastPkts", "OutMaxUniCastPkts", "OutMinUniCastPkts", 
	"OutAvgMultiCastPkts", "OutMinMultiCastPkts", "OutMaxMultiCastPkts"],
	responseTime: ["AvgResponseTime", "MinResponseTime", "MaxResponseTime", "PercentLoss", "PercentDown", "Availability"],
	volumeUsage: ["DiskSize", "AvgDiskUsed", "MinDiskUsed", "MaxDiskUsed", "PercentDiskUsed", "AllocationFailures"],
	volumePerformance: ["AvgDiskQueueLength", "MinDiskQueueLength", "MaxDiskQueueLength", "AvgDiskTransfer",
	 "MinDiskTransfer", "MaxDiskTransfer", "AvgDiskReads", "MinDiskReads", "MaxDiskReads", "AvgDiskWrites", 
	 "MinDiskWrites", "MaxDiskWrites"]
};
SolarWindsMetricsJS.prototype = Object.extendsObject(AProbe, {
   initialize: function(probe) {
	  this.probe = probe;
   },
  
	/**
	 * Function that the MID server uses to RUN the script for the metrics. Main logic lies here.
	 * This is the code that the MID Server will run on each Iteration for the metrics.
	 * @returns An Object with specidfic associated Script return values [status,last_kpi_signature,error]
	 */
    retrieveKpi: function() {
    	ms.log(SOURCE + ": metrics");
    	var allActiveMetricsFiltered;
    	var filteredActiveMetricsObj;
    	// Just for performance testing
    	var startScriptTime = new Date();
    	var retVal = {};
    	var isValidNumber,i;
    	isDebug = "" + this.probe.getAdditionalParameter("debug");
    	isDebugResponsе = "" + this.probe.getAdditionalParameter("debug_response");
	islogPayloadForDebug = "" + this.probe.getAdditionalParameter("logPayloadForDebug");
    	NOW_OFFSET = this.probe.getAdditionalParameter("offset_min") || 0;
    	if(NOW_OFFSET >= 0) {
    		this.debug("offset_min parameter set to " + NOW_OFFSET + " min");
    		NOW_OFFSET *= 60000;
    	} else {
    		this.debug("INVALID/MISSING offset_min additional parameter. Setting it to 5 min.");
    		NOW_OFFSET = 300000;
    	}
    	// Returns csv string with all active types from service now.
    	var allActiveMetricsCsv = this.getActiveMetrics();
    	if(allActiveMetricsCsv != "") {
	    	var allActiveMetricsSplitedArr = allActiveMetricsCsv.split(",");
	    	// Because snow returns not only the unique active metrics, we need to filter them
	    	// Returns array with only unique values
	    	allActiveMetricsFiltered = allActiveMetricsSplitedArr.filter(function(elem, i, arr) {
	    		return arr.indexOf(elem) == i;
		    });
			// Object where we will collect all the active metrics separated per type
			filteredActiveMetricsObj = {
				cpuAndMemory: [],
				interfaceTraffic: [],
				responseTime: [],
				volumeUsage: [],
				volumePerformance: []
			};
			// Adds the active metrics per type
			allActiveMetricsFiltered.forEach(function(activeMetric) {
				// We need to slice the first and the last symbol of the metric string, because
				// it's comming with quotes inside the string
				var currentMetric = activeMetric.slice(1,-1);
				for(var key in allMetricsObj) {
					if(allMetricsObj[key].indexOf(currentMetric) > -1) {
						filteredActiveMetricsObj[key].push(currentMetric);
					}
				}
			}, this);
    	} else {
    		allActiveMetricsFiltered = "";
    	}
		// Additional param which indicates in minutes, how much time we should go back for the initial run
		// Also for example if the connector was stopped for X time and we run it. If the time between
		// current time and LAST_METRIC_TIME is more than 'maxFetchIntervalMin', we are starting the fetch
		// from current time minus(-) maxFetchIntervalMin.
		// This is a safe mechanism just to be on the safe side, because otherwise we can overflow the MID.
		var maxFetchIntervalMin = this.probe.getAdditionalParameter("max_fetch_interval_min");
		if(StringUtil.nil(maxFetchIntervalMin)) {
			secondsSinceLastFetch = DEFAULT_MAX_FETCH_INTERVAL_MIN * 60;
			ms.log(SOURCE + ": max_fetch_interval_min is empty or missing! Please check the definition. We are setting it to " + DEFAULT_MAX_FETCH_INTERVAL_MIN);
		} else {
			maxFetchIntervalMin = parseInt(maxFetchIntervalMin);
			isValidNumber = maxFetchIntervalMin > 0 ? true : false;
			
			if(isValidNumber) {
				secondsSinceLastFetch = maxFetchIntervalMin * 60;
			} else {
				secondsSinceLastFetch = DEFAULT_MAX_FETCH_INTERVAL_MIN * 60;
				ms.log(SOURCE + ": max_fetch_interval_min is not valid! Please double check and enter minutes. We are setting it to " + DEFAULT_MAX_FETCH_INTERVAL_MIN);
			}
		}
		LAST_METRIC_TIME = this.getLastMetricSignature(secondsSinceLastFetch);
		var sourceInstance =  "" + this.probe.getParameter("connector_name");
    	// Gets the respond for CPU and MEMORY
		var num_calls = Math.ceil(this.getCount(CPU_AND_MEMORY_TABLE_NAME)/max_fetch);
		for(i=1;i<=num_calls;i++){
			var cpuAndMemoryMetrics = this.getMetrics(allActiveMetricsFiltered,
													  allAttributesObj.cpuAndMemory,
													  CPU_AND_MEMORY_TABLE_NAME,
													  filteredActiveMetricsObj,
													  CPU_AND_MEMORY,
													  i*max_fetch-(max_fetch-1),
													  i*max_fetch);

			// Itterates the the array of objects and filtering the data to RawMetrics,
			// then send it to service now
			cpuAndMemoryMetrics.results.forEach(function(objInfo) {
				this.handleMetric(CPU_AND_MEMORY_TABLE_NAME, objInfo, sourceInstance);
			}, this);
		}
		
		// Gets the respond for INTERFACE TRAFFIC
		num_calls = Math.ceil(this.getCount(INTERFACE_TRAFFIC_TABLE_NAME)/max_fetch);
		for(i=1;i<=num_calls;i++){
			var interfaceTrafficMetrics = this.getMetrics(allActiveMetricsFiltered,
														  allAttributesObj.interfaceTraffic,
														  INTERFACE_TRAFFIC_TABLE_NAME,
														  filteredActiveMetricsObj,
														  INTERFACE_TRAFFIC,
														  i*max_fetch-(max_fetch-1),
														  i*max_fetch);

			// Itterates the the array of objects and filtering the data to RawMetrics,
			// then send it to service now
			interfaceTrafficMetrics.results.forEach(function(objInfo) {
				this.handleMetric(INTERFACE_TRAFFIC_TABLE_NAME, objInfo, sourceInstance);
			}, this);
		}
		
		// Gets the respond for RESPONSE TIME
		num_calls = Math.ceil(this.getCount(RESPONSE_TIME_TABLE_NAME)/max_fetch);
		for(i=1;i<=num_calls;i++){
			var responseTimeMetrics = this.getMetrics(allActiveMetricsFiltered,
													  allAttributesObj.responseTime,
													  RESPONSE_TIME_TABLE_NAME,
													  filteredActiveMetricsObj,
													  RESPONSE_TIME,
													  i*max_fetch-(max_fetch-1),
													  i*max_fetch);

			// Itterates the the array of objects and filtering the data to RawMetrics,
			// then send it to service now
			responseTimeMetrics.results.forEach(function(objInfo) {
				this.handleMetric(RESPONSE_TIME_TABLE_NAME, objInfo, sourceInstance);
			}, this);
		}
		
    	// Gets the respond for VOLUME USAGE
		num_calls = Math.ceil(this.getCount(VOLUME_USAGE_TABLE_NAME)/max_fetch);
		for(i=1;i<=num_calls;i++){
			var volumeUsageMetrics = this.getMetrics(allActiveMetricsFiltered,
													 allAttributesObj.volumeUsage,
													 VOLUME_USAGE_TABLE_NAME,
													 filteredActiveMetricsObj,
													 VOLUME_USAGE,
													 i*max_fetch-(max_fetch-1),
													 i*max_fetch);

			// Itterates the the array of objects and filtering the data to RawMetrics,
			// then send it to service now
			volumeUsageMetrics.results.forEach(function(objInfo) {
				this.handleMetric(VOLUME_USAGE_TABLE_NAME, objInfo, sourceInstance);
			}, this);
		}
		
    	// Gets the respond for VOLUME PERFORMANCE
		num_calls = Math.ceil(this.getCount(VOLUME_PERFORMANCE_TABLE_NAME)/max_fetch);
		for(i=1;i<=num_calls;i++){
			var volumePerformanceMetrics = this.getMetrics(allActiveMetricsFiltered,
														   allAttributesObj.volumePerformance,
														   VOLUME_PERFORMANCE_TABLE_NAME,
														   filteredActiveMetricsObj,
														   VOLUME_PERFORMANCE,
														   i*max_fetch-(max_fetch-1),
														   i*max_fetch);

			// Itterates the the array of objects and filtering the data to RawMetrics,
			// then send it to service now
			volumePerformanceMetrics.results.forEach(function(objInfo) {
				this.handleMetric(VOLUME_PERFORMANCE_TABLE_NAME, objInfo, sourceInstance);
			}, this); 
		}
        if(errorMessage.length > 0) {
            retVal["status"] = FAILURE.toString();
            retVal["error_message"] = errorMessage;
        } else {
            retVal["status"] = SUCCESS.toString();
        }
    	retVal["last_kpi_signature"] = LAST_METRIC_TIME.toString();
    	// Log the last metric time read from solarwinds
		this.debug(SOURCE + "last kpi signature = "+ LAST_METRIC_TIME.toString());
    	retVal['metric_source']  = "" + SOURCE;
		if(metricCounter > 0) {
	        var totalDuration = Number((new Date().getTime() - startScriptTime.getTime()));
			var totalDurationSec = (totalDuration / 1000).toFixed(3);
			this.debug(SOURCE + ": MetricCollector handle total of " + metricCounter + " metrics in " + totalDurationSec + " seconds (" + Number(metricCounter/totalDurationSec).toFixed(3) + " per second)");
			retVal['metric_count']  = "" + metricCounter;
			retVal['metric_duration']  = "" + totalDuration;
		}
    	return retVal;
    },
	/**
	 * Takes the active metric types from service now 
	 *
	 * @returns {String} csv format
	 */
	getActiveMetrics: function() {
		var HandleTypes = HandleTypesProvider.getMetrictTypeHandler();
		var typesFromCache = HandleTypes.getActiveTypesForSql(SOURCE);
		return typesFromCache + "";
		
	},
	/**
	 * Settings for the request
	 *
	 * @param {Object} allAttributes - All the attributes from the query.
	 * @param {String} metricType - Passing the metric type so can know for which of 
	 * the activeAttributes we need to make an request
 	 * @param {String} sqlTableName
 	 * @param {Object} filteredActiveMetricsObj - Object with filtered active metrics per type. Using it only if 
 	 * 'allActiveMetricsFiltered' is empty(that's mean that we are not in Registration mode)
	 * @param allActiveMetricsFiltered - collected active metrics from snow in string format which we split on later stage
	 * 
	 * @returns {Object} JSON object from the request
	 */
 	getMetrics: function(allActiveMetricsFiltered, allAttributes, sqlTableName, filteredActiveMetricsObj, metricType, rows_from, rows_to) {
 		var response, endDate = this.formatDate(nowUTC.getTime() - NOW_OFFSET);
 		if(allActiveMetricsFiltered == "") {
 			this.debug(SOURCE + ": Running in registration mode. Metric type: " + metricType);
			response = this.getResult("POST", "/SolarWinds/InformationService/v3/Json/Query", {
					select: allAttributes,
					from: {table: sqlTableName, name: "A"},
					dateFrom: startDate,
					dateTill: endDate,
					withrows: rows_from+" TO "+rows_to
			});
 		} else {
 			var activeAttributes = this.getAllActiveAttributes(filteredActiveMetricsObj, metricType);
 			if(activeAttributes[metricType].length < 1) {
 				this.debug(SOURCE + ": There is no active metrics for the current type: " + metricType);
 				return;
 			}
			response = this.getResult("POST", "/SolarWinds/InformationService/v3/Json/Query", {
					select: activeAttributes[metricType],
					from: {table: sqlTableName, name: "A"},
					dateFrom: startDate,
					dateTill: endDate,
					withrows: rows_from+" TO "+rows_to
			});
 		}
 		this.debugResponse(response, metricType);
		return response;
	},
	/**
	 * In the 'filteredActiveMetricsObj' we have all the active metrics separated per type. Now here we need to 
	 * add these metrics to the 'allDefaultAttributeObj'. We'll do this only for the metricType where we have any active
	 * metrics
	 *
	 * @param {Object} filteredActiveMetricsObj - Object with array attributes for each type with metrics filled per type 
	 * @param {String} metricType - Example: 'volumeUsage' or 'responseTime' and etc.
	 *
	 * @returns {Array} [...] Array of objects with added the metrics from additionalParamCsv
	 */
	getAllActiveAttributes: function(filteredActiveMetricsObj, metricType) {
		// We are using this object to not pollute the global 'allDefaultAttributeObj'
		var allActiveTypes = {
			cpuAndMemory: [],
			interfaceTraffic: [],
			responseTime: [],
			volumeUsage: [],
			volumePerformance: []
		};
		// We need to concatenate the default attributes from 'allDefaultAttributeObj'
		// with the filtered active metrict from 'filteredActiveMetricsObj' for the current 'metricType'.
		// So after that to build the query.
		if(filteredActiveMetricsObj[metricType].length > 0) {
			// allDefaultAttributeObj is global
			allActiveTypes[metricType] = allDefaultAttributeObj[metricType];
			filteredActiveMetricsObj[metricType].forEach(function(metric) {
				// Pushing all the matching metrics into allDefaultAttributeObj global object
				allActiveTypes[metricType].push({"metric": metric});
			}, this);
		}
		return allActiveTypes;
	},
	/**
	 * Creating raw metrics with RawMetrics constructor and 
	 * send them to service now
	 *
 	 * @param monitoredType - String constant with the monitoredType. For ex. "CPU_AND_MEMORY"
 	 * @param objInfo - Object with info for the metrics and the metrics
 	 * @param sourceInstance
	 */
	handleMetric: function(monitoredType, objInfo, sourceInstance) {
		var metricHandler = MetricFactory.getMetricHandler();
		var ciIdentifier = {};
		var node, resource, metricType, metricValue, metricTimeStamp, monitoredObjType,
		// We need to have an array where to check which attributes are metrics
		checklist;
		// Filling the node. If we don't find any data for it throwing an Error
		if(objInfo.hasOwnProperty("Node_NodeName") && objInfo["Node_NodeName"] != "" && objInfo["Node_NodeName"] != null) {
			node = objInfo["Node_NodeName"];
		}
		else if(objInfo.hasOwnProperty("Node_SysName") && objInfo["Node_SysName"] != "" && objInfo["Node_SysName"] != null) {
			node = objInfo["Node_SysName"];
		}
		else if(objInfo.hasOwnProperty("Node_DNS") && objInfo["Node_DNS"] != "" && objInfo["Node_DNS"] != null) {
			node = objInfo["Node_DNS"];
		}
		else if(objInfo.hasOwnProperty("Node_IPAddress") && objInfo["Node_IPAddress"] != "" && objInfo["Node_IPAddress"] != null) {
			node = objInfo["Node_IPAddress"];
		}
		else {
			node = "";
			ms.log(SOURCE + ": Node is empty!");
		}
		// These attributes are default for all types
		this.setCiIdentifier(ciIdentifier, "Node_NodeID", objInfo["Node_NodeID"]);
		this.setCiIdentifier(ciIdentifier, "Node_Vendor", objInfo["Node_Vendor"]);
		this.setCiIdentifier(ciIdentifier, "Node_MachineType", objInfo["Node_MachineType"]);
		this.setCiIdentifier(ciIdentifier, "InstanceType", objInfo["InstanceType"]);
		this.setCiIdentifier(ciIdentifier, "Node_Location", objInfo["Node_Location"]);
		this.setCiIdentifier(ciIdentifier, "Node_Caption", objInfo["Node_Caption"]);
		this.setCiIdentifier(ciIdentifier, "Node_IPAddressType", objInfo["Node_IPAddressType"]);
		if(monitoredType == CPU_AND_MEMORY_TABLE_NAME || monitoredType == RESPONSE_TIME_TABLE_NAME) {					
			monitoredObjType = objInfo["Node_Vendor"] + "." + objInfo["Node_MachineType"];
		}
		else if(monitoredType == INTERFACE_TRAFFIC_TABLE_NAME) {
			var interfaceMac = this.macAddressFormater(objInfo["Interface_MAC"], ":");
			var interfacePhisicalAddress = this.macAddressFormater(objInfo["Interface_PhysicalAddress"], ":");
			this.setCiIdentifier(ciIdentifier, "mac_address", interfaceMac);
			this.setCiIdentifier(ciIdentifier, "Interface_PhysicalAddress", interfacePhisicalAddress);
			this.setCiIdentifier(ciIdentifier, "name", objInfo["Interface_Alias"]);
			this.setCiIdentifier(ciIdentifier, "Interface_Name", objInfo["Interface_Name"]);
			this.setCiIdentifier(ciIdentifier, "Interface_InterfaceName", objInfo["Interface_InterfaceName"]);
			this.setCiIdentifier(ciIdentifier, "Interface_InterfaceID", objInfo["Interface_InterfaceID"]);
			this.setCiIdentifier(ciIdentifier, "Interface_InterfaceCaption", objInfo["Interface_InterfaceCaption"]);
			monitoredObjType = objInfo["Interface_InterfaceTypeDescription"];
			resource = objInfo["Interface_InterfaceName"];
		}	
		else if(monitoredType == VOLUME_USAGE_TABLE_NAME || monitoredType == VOLUME_PERFORMANCE_TABLE_NAME) {	
			this.setCiIdentifier(ciIdentifier, "Volume_VolumeID", objInfo["Volume_VolumeID"]);
			this.setCiIdentifier(ciIdentifier, "Volume_Caption", objInfo["Volume_Caption"]);
			this.setCiIdentifier(ciIdentifier, "Volume_DeviceId", objInfo["Volume_DeviceId"]);
			
			if(monitoredType == VOLUME_PERFORMANCE_TABLE_NAME) {
				this.setCiIdentifier(ciIdentifier, "VolumeID", objInfo["VolumeID"]);
			}
			monitoredObjType = objInfo["Volume_Type"];
			if(objInfo["Volume_Type"] == "Fixed Disk" || objInfo["Volume_Type"] == "FixedDisk"){
				// Check if deviceId is empty, if it is empty assign volume caption value to deviceId
				var deviceId = objInfo["Volume_DeviceId"];
				if (!deviceId || deviceId === ""){
					deviceId = objInfo["Volume_Caption"];
					this.debug("device id is empty or null, applying volume caption: " + deviceId);
				}
				if(objInfo["Node_Vendor"] == "Windows") {
					resource = deviceId + "\\";
				} else {
					resource = deviceId;
				}
			} else {
				resource = objInfo["Volume_Type"];
			}
			this.setCiIdentifier(ciIdentifier, "Volume_Mount_Point", resource);
		} else {
			ms.log(SOURCE + ": THERE IS NO SUCH METRIC TYPE!");
		}
		if(objInfo.hasOwnProperty("DateTime")) {
			// Need the timestamp of the metric date
			// The time is comming on UTC format and we parse it to current time.
			metricTimeStamp = this.parseDate(objInfo["DateTime"]);
		} else {
			ms.log(SOURCE + " : DateTime is missing");
		}
		// Checks if the current metric time is bigger than the last metric time
		LAST_METRIC_TIME = metricTimeStamp > parseInt(LAST_METRIC_TIME) ? metricTimeStamp : LAST_METRIC_TIME;
		// We need to split the checklist per TABLE_NAME, because cpuAndMemory with responeTime tables
		// are with the same attributes but diffrent checklists
		if(monitoredType == CPU_AND_MEMORY_TABLE_NAME) {
			// Check-list. An array where to check which attributes are metrics
			checklist = allMetricsObj.cpuAndMemory;
		}
		else if(monitoredType == INTERFACE_TRAFFIC_TABLE_NAME) {
			// Check-list. An array where to check which attributes are metrics
			checklist = allMetricsObj.interfaceTraffic;
		}
		else if(monitoredType == RESPONSE_TIME_TABLE_NAME) {
			// Check-list. An array where to check which attributes are metrics
			checklist = allMetricsObj.responseTime;
			resource = node;
		}
		else if(monitoredType == VOLUME_USAGE_TABLE_NAME) {
			// Check-list. An array where to check which attributes are metrics
			checklist = allMetricsObj.volumeUsage;
		}
		else if(monitoredType == VOLUME_PERFORMANCE_TABLE_NAME) {
			// Check-list. An array where to check which attributes are metrics
			checklist = allMetricsObj.volumePerformance;
		} else {
			ms.log("THERE IS NO SUCH METRIC TYPE!");
		}
		for (var key in objInfo) {
			if(checklist.indexOf(key) > -1) {
				metricType = key;
				metricValue = parseFloat(objInfo[key]);
				// We need to split the metrics type for CPU and MEMORY
				if(monitoredType == CPU_AND_MEMORY_TABLE_NAME) {
					var memory = metricType.indexOf("Memory");
					var cpu = metricType.indexOf("Load");
					if(memory > -1) {
						resource = "Memory";
					}
					else if(cpu > -1) {
						resource = "CPU";
					}
					else {
						resource = node;
					}
				}
				//DEF0377566 : Adding resource_path in events additional info
				//All the fields in ciIdentifier map are added to additional_info of event
				this.setCiIdentifier(ciIdentifier, "resource_path", resource);

				// Jakarta's constructor: 
				// public RawMetric(String metricType, String metricTypeId, String resource, String node, String ci, float value, long timestamp,
				// Map<String, String> ciIdentifier, String source, String sourceInstance, String monitoredObjType)
				var rawMetric = new RawMetric(metricType, "", resource, node, "", metricValue, 
				metricTimeStamp, ciIdentifier, SOURCE, sourceInstance, monitoredObjType);
				// Sending the raw metric
				metricHandler.handleMetric(rawMetric);
				// getting value of metric object using getter function written in class "RawMetric" 
				this.logPayload("Metric object sent for Solarwinds metric creation: Source: "+rawMetric.getSource()+" ,SourceInstance: "+rawMetric.getSourceInstance()+" ,MetricType: "+rawMetric.getMetricType()+" ,Resource: "+rawMetric.getResource()+" ,Node: "+rawMetric.getNode()+" ,Value: "+rawMetric.getValue()+" ,timestamp: "+rawMetric.getTimestamp()+" ,Ci: "+rawMetric.getCI()+" ,CiIdentifier: "+JSON.stringify(rawMetric.getCiIdentifier())+" ,MonitoredObjectType:"+rawMetric.getMonitoredObjectType()+" ,ResourceId: "+rawMetric.getResourceId());
				// Just for debug perposes, we are counting the total metrics collected per run
				metricCounter++;
			}
		} 
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
	 * Just call the createRequest function and checks if the request is valid
	 *
 	 * @param type - the type of the request [GET, POST, ... ]
 	 * @param method - the URI of the request
 	 * @param params - the parameters of the request. For ex: table name, attributes, startDate
 	 *
 	 * @returns {Object} The request in JSON format
	 */
	getResult : function (type, method, params) {
		var response;
		var req = this.createRequest(type, method, params);
		if(!!req){
			response = this.parseJSON(req);
			return response;
		}
		return [];
	},
	/**
	 * Creating and sending the request
	 *
 	 * @param type - the type of the request [GET, POST, ... ]
 	 * @param method - the URI of the request
 	 * @param params - the parameters of the request. For ex: table name, attributes, startDate
 	 *
 	 * @returns {Boolean} return false if the status is different than 200
 	 * @returns {Object} the response
	 */
	createRequest: function(type, method, params) {
		var username = this.probe.getParameter("username") || "";
		var password = this.probe.getParameter("password") || "";
		var host = this.probe.getParameter("host") || "";
		var port = parseInt(this.probe.getAdditionalParameter("port")) || 8081;
		var protocol = this.probe.getAdditionalParameter("protocol") || "https";
		port = (port === 80 ? "" : (":" + port));
		var query = this.getRequestQuery(type, params);
		var url = protocol + "://" + host + port + method;
		var response;
		if(type == "GET" || type == "COUNT"){
			url += query;
		}
		url = encodeURI(url);
		// Using this global variable only for debuging purposes. It will be logged into the debugResponse only if the additional parameter
		// 'debug_response' is added into the instance with value 'true'
		queryForDebug = "QUERY FROM: " + params.from.table + ": HTTPS URL" + url + " :\n" +  JSON.stringify(query);
		
		var request = new HTTPRequest(url);
		request.setBasicAuth(username, password);
		request.addHeader('Content-Type', 'application/json');
		try {
			if(type == "GET" || type == "COUNT"){
				response = request.get();
			}else{
				response = request.post(JSONparser.encode(query));
			}
			var status = response.getStatusCode();
			if (status === 200) {
				return response;
			} else {
				this.addError("RESPONSE STATUS ERROR No: " + status);
				this.addError("RESPONSE ERROR : " + response.getBody());
				return false;
			}
		}
		catch (e) {
			this.addError(e.toString());
		}
	},
	/**
	 * Checks the type of the request and call the setQuery function
	 *
 	 * @param type - the type of the request [GET, POST, ... ]
 	 * @param params - the parameters of the request. For ex: table name, attributes, startDate
 	 *
 	 * @returns {String} returns the query string if the type of the request is GET
 	 * @returns {Object} obj if the type of the request is POST
	 */
	getRequestQuery: function (type, params) {
		if(type == "COUNT"){
			
			var q = this.setQuery("?query=SELECT COUNT(*) AS metricCount ", params);
			return q;
		}
		if(type == "GET") {
			var q = this.setQuery("?query=SELECT ", params);
			return q;
		} else {
			var obj= {};
			obj.query = this.setQuery("SELECT ", params);
			return obj;
		}
		
	},
	/**
	 * Concatenating the query
	 *
 	 * @param startQuery - String with the beggining of the query
 	 * @param params - the parameters of the request. For ex: table-name, attributes, startDate
 	 *
 	 * @returns {String} returns the concatenated query string
	 */
	setQuery: function(startQuery, params) {
		var metric,q = startQuery;

		if(params.select){
			params.select.forEach(function(item, index) {
				if(item.hasOwnProperty("field")) {
					q += item.field + " AS " + item.name + ", ";
				} 
				else if(item.hasOwnProperty("attribute")) {
					q += item.attribute + ", ";
				}
				else if(item.hasOwnProperty("metric")) {
					q += item.metric + (index == params.select.length - 1 ? "" : ", ");
					metric = item.metric;
				} 
				else {
					ms.log(SOURCE + ": There is no such property in setQuery function");
				}
			});
		}	

		q += " FROM " + params.from.table + " AS " + params.from.name;

		if(params.hasOwnProperty("dateTill")) {
			q += " WHERE (" + params.from.name + ".DateTime > '" + this.formatDate(params.dateFrom.getTime()) + "' AND " + params.from.name + ".DateTime < '" + params.dateTill + "')";
		} else {
			q += " WHERE (" + params.from.name + ".DateTime > '" + this.formatDate(params.dateFrom.getTime()) + "')";
		}
		if(metric) q += " ORDER BY "+metric;
		
		if(params.hasOwnProperty("withrows")) {
			q += " WITH ROWS "+ params.withrows;
		}
		if (q.length < 2) q = "";

		return q;
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
		// Set to (DEFAULT_MAX_FETCH_INTERVAL_MIN * 60) if it's not passed as parameter
		secondsSinceLastFetch = secondsSinceLastFetch || (DEFAULT_MAX_FETCH_INTERVAL_MIN * 60);
		var lastMetricSignature = this.probe.getParameter("last_kpi_signature") || 0 ;
		// Just to be on the safe side
		if(StringUtil.nil(lastMetricSignature)) {
			lastMetricSignature = 0;
		}
		var passTimeSeconds = (now.getTime() - parseInt(lastMetricSignature)) /1000;
		// Only for the initializing of lastMetricSignature
	 	if(lastMetricSignature == 0) {
			// lastMetricSignature is empty, we will start to retrieved from nowUTC minus(-) 'secondsSinceLastFetch'
	  		startDate = new Date(nowUTC.getTime() - NOW_OFFSET - (secondsSinceLastFetch * 1000));
	  		lastMetricSignature = now.getTime() - NOW_OFFSET - (secondsSinceLastFetch * 1000);
			ms.log(SOURCE + ": MetricCollector: last_kpi_signature was empty. Initializing...lastMetricSignature: " + this.formatDate(new Date(lastMetricSignature).getTime()) + " local time");
	  	}
	  	// If the connector instance was stopped for more than secondsSinceLastFetch(by default 0 and 
	  	// can be configurable by additional parameter)
	  	// we start the collection from (current time - secondsSinceLastFetch) like the initial run
	  	else if(passTimeSeconds > secondsSinceLastFetch) {
	  		startDate = new Date(nowUTC.getTime() - NOW_OFFSET - (secondsSinceLastFetch * 1000));
	  		lastMetricSignature = now.getTime() - NOW_OFFSET - (secondsSinceLastFetch * 1000);
	  		ms.log(SOURCE + ": MetricCollector: last_kpi_signature was more than " + (secondsSinceLastFetch / 60) + " minutes ago. Starting to fetch from " +  this.formatDate(startDate.getTime()) + "UTC time. Setting lastMetricSignature to " + this.formatDate(lastMetricSignature) + " local time");
	  	} 
	  	else {
		 	var lastMetricTime =  new Date(parseInt(lastMetricSignature));
		 	var lastMetricTimeUTC = new Date(lastMetricTime.getUTCFullYear(),lastMetricTime.getUTCMonth(), lastMetricTime.getUTCDate() , lastMetricTime.getUTCHours(), lastMetricTime.getUTCMinutes(), lastMetricTime.getUTCSeconds(), lastMetricTime.getUTCMilliseconds());
	  		startDate = lastMetricTimeUTC;
	  		ms.log(SOURCE + ": MetricCollector: last_kpi_signature was as expected. Starting the fetch from " + this.formatDate(startDate.getTime()) + " UTC time");
	  	}
	  	return lastMetricSignature + "";
    },
    
	/**
	 * Format the macAddress string from "1234567890" to "12:34:56:78:90"
	 * depends on the separator
	 *
 	 * @param separator - string letter which will be added as separator to the macAddress string
 	 * @param macAddress - 10 digits string from the macAddress metric
 	 * @returns {String} The formated macAddress
	 */
    macAddressFormater: function(macAddress, separator) {
    	var result = "";
    	// Just to be sure it's string
    	macAddress = "" + macAddress;
    	macAddress.split("")
    	.forEach(function(letter, index) {
    		if(index % 2 != 0 && index != (macAddress.length - 1)) {
    			result += letter + separator;
    		} else {
    			result += letter;
    		}
    	}, this);
    	return result;
    },
	/**
	 * Format the date into string format as per pattern
	 *
 	 * @param timeInMilliseconds
 	 * @returns {String} The formated date as per pattern
	 */
	formatDate: function(timeInMilliseconds) {
		var pattern = "yyyy/MM/dd HH:mm:ss.SSS";
	    
		var format = new SimpleDateFormat(pattern);
	    var lastMetricDate = new Date(parseInt(timeInMilliseconds));
	    var dateFormat = format.format(lastMetricDate);
	    
	    return "" + dateFormat;
	},
	getCount: function(tablename) {
		
		var count = 0;
		var endDate = this.formatDate(nowUTC.getTime() - NOW_OFFSET);
		try{
			var response = this.getResult("COUNT","/SolarWinds/InformationService/v3/Json/Query",{
				from: {table: tablename, name: "A"},
				dateFrom: startDate,
				dateTill: endDate
			});
			if(response.results){
				count = response.results[0].metricCount;
				return count;
			}else {
				this.addError("Response Result is empty : "+response.results);
				return;
			}
		}catch (e) {
			this.addError(e.toString());
		}
		
	},
	/**
	 * We are receiving the metric time in this UTC time zone format 2017-03-21T14:36:05.463
	 * and then we need to convert it into current zone date format
	 *
 	 * @param metricFormatDataStr - the date from DateTime_ parameter of the request
 	 * @returns {String} The formated date in milliseconds
	 */
	parseDate: function (metricFormatDataStr) { 
		var miliseconds;
		metricFormatDataStr = metricFormatDataStr.split(/(-)|([a-zA-Z])|(:)|(\.)/g)
												 .filter(function(el) {
												 	if(!isNaN(el)) {
														return el;
												 	}
												 }, this);
		if(!!metricFormatDataStr[6]){		
			if(metricFormatDataStr[6].toString().length > 3) {
				miliseconds = Number(metricFormatDataStr[6].toString().slice(0,3))
			} else {
				miliseconds = metricFormatDataStr[6];
			}
		} else {
			miliseconds = 0;
		}
		var d = Date.UTC(metricFormatDataStr[0], metricFormatDataStr[1] - 1, metricFormatDataStr[2], 
					metricFormatDataStr[3], metricFormatDataStr[4], metricFormatDataStr[5], miliseconds);
		if(d){
			// yyyy-MM-dd HH:mm:ss.ms
			return d;
		}else{
			this.debug("EVENT DATE PARSE PROBLEM: " + metricFormatDataStr);
			return "";
		}
	},
	/**
	 * Parsing the response from string to JSON
	 *
 	 * @param response - response from the http request
 	 * @returns {Object} the result from the response in JSON format
	 */
	parseJSON : function (response) {
		var parser = new JSONParser();
		var resultJson =  parser.parse(response.getBody());
		this.debug(SOURCE + ": Found " + resultJson.results.length + " records");
		return resultJson;
		
	},
	/**
	 * Concatenating a message to errorMessage variable
	 *
 	 * @param message
	 */
	addError : function(message){
		if (errorMessage === "")
			errorMessage = SOURCE + ": " +message;
		else
			errorMessage += "\n" + message;
		ms.log(message);
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
	/**
	 * Logging a metric object if the additional parameter islogPayloadForDebug is set to be true
	 *
 	 * @param message
	 */
	logPayload: function(message){
		if (islogPayloadForDebug == true || islogPayloadForDebug == "true" ){
			ms.log(SOURCE + ": " + message);
		}
		return true;
	},
	/**
	 * Logging the query and response per type
	 *
 	 * @param {Object} response
 	 * @param {String} type - The type for which we are logging the response
	 */
	debugResponse: function(response, type) {
		if(isDebugResponsе == "true" || islogPayloadForDebug == true || islogPayloadForDebug == "true" ) {
			// 'queryForDebug' is global variable so we can log both the query and the response
			ms.log(SOURCE + ": " + queryForDebug);
			if(response.hasOwnProperty("results")) {
				ms.log("With response for : " + type + ": " + JSON.stringify(response.results));
			} else {
				ms.log("There is no attribute 'results' from the response!")
			}
		}
	},
    type: "SolarWindsMetricsJS"
});
 SolarWindsMetricsJS.get = function(probe){
	this.debug(SOURCE+ ": SolarWindsMetricsJS invoked");
	return new SolarWindsMetricsJS(probe);
   };
