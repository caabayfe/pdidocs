var MetricsCacheUtils = Class.create();


MetricsCacheUtils.prototype = {

	initialize: function() {
		ms.log("MetricsCacheUtils: Starting initialize");
		this.MetricRegistrationCacheFactory = Packages.com.service_now.metric.cache.MetricRegistrationCacheFactory;
		this.MetricFactory = Packages.com.service_now.metric.MetricFactory;
		this.SeriesKey = Packages.com.snc.sa.metric.common.model.SeriesKey;
		this.StringUtil = Packages.com.glide.util.StringUtil;
		this.metric2CiCache = this.MetricRegistrationCacheFactory.getMetricCache("sa_metric_map");
		this.timeSeriesModelCache = this.MetricFactory.getTimeSeriesModelCache();

	},
	
	getModelInfo: function(ciSysId, resourceId, metricTypeId) {
		var seriesKey = new this.SeriesKey(ciSysId, resourceId, metricTypeId);
		var ciMetricModel = this.timeSeriesModelCache.get(seriesKey);
		var classifier = ciMetricModel.getClassifier();
		var expiration = ciMetricModel.getExpirationTime();
		var trainedTime = ciMetricModel.getTrainedTime();
		ms.log(" Model classifier: " + classifier + ", Expiration time: " + expiration + ", Trained time: " + trainedTime);
		if (ciMetricModel != null && ciMetricModel.getModel().getTimeSeriesModel() != null) 
			ms.log("Model info: " + ciMetricModel.getModel().getTimeSeriesModel().toString());
		else if (ciMetricModel != null && ciMetricModel.getModel().getLocalLevelKalmanFilterModel()) {
			ms.log("Model info: " + ciMetricModel.getModel().getLocalLevelKalmanFilterModel().toString());
		} else 
			ms.log(" Model info: Time Series Model not found");
	
	},
	
	/**
	 * @return the total number of entry models in the cache.
	 */
	getNumOfModels: function() {
		var numOfModels = this.timeSeriesModelCache.getNumberOfEntries();
		ms.log(" The total number of entries: " + numOfModels);
	
	},
	
	
	/**
	 * @return all entry models for a specifc CI.
	 */
	getModelsByCi: function(ciSysId) {
		var listOfModels = this.timeSeriesModelCache.getAllByCi(ciSysId);
		for (var i=0; i < listOfModels.size(); i++) {
			var currentModel = listOfModels.get(i);
			this.__printModelEntry(currentModel);
		}
	},
	
	/**
	 * Try to avoid the usage of this function on production env
	 * For debug purpose only
	 * @return all models and print each record.
	 */
	getAllModels: function() {
		var listOfModels = this.timeSeriesModelCache.getAll();
		for (var i=0; i < listOfModels.size(); i++) {
			var currentModel = listOfModels.get(i);
			this.__printModelEntry(currentModel);
		}
	},
	
	/**
	 * This function returns the number of active records in Metric 2 Ci Cache on MID by Identifier
	 * @param identifier 
	 * @return Metric2CiCacheEntry.
	 * Example of Identifier:
	 * identifier = "MonitoringObjectFullName:Processor:Processor Time | _Total:hwettalosqlnd1.hcwext.local; InstanceName:_Total; ObjectName:Processor; metricType:Processor Time | _Total";
	 */
	getCacheEntryByIdentifier: function(identifier) {
		return this.metric2CiCache.getValue(identifier);
	},
	
	/**
	 * @return the number records in cache.
	 */
	getCacheSize: function() {
		return this.metric2CiCache.getCache().size();
	},
	
	/**
	 * This print all the records to the MID file
	 * Since this payload can be very large it will not arrive to as response
	 * To see the result see the mid log file in (grab agent logs)
	 * @return the number of active records.
	 */
	printMetric2CiCacheAll: function() {
		var itr = this.metric2CiCache.getCache().iterator();
		while(itr.hasNext()) {
			var cacheEntry  = itr.next();
			this.__printCacheEntry(cacheEntry);
		}
	},
	
	/**
	 * This function returns the number of active records in Metric 2 Ci Cache on MID
	 * @return the number of active records.
	 */
	getNumberOfActiveRecords: function() {
		return this.metric2CiCache.getNumberOfActiveRecords();
	},
	
	/**
	 * This function returns the number of active records in Metric 2 Ci Cache on MID by Agent ID
	 * @param agentId - the unique number that reperesnt agent
	 * @return the number of active records.
	 */
	getNumberOfActiveRecordsByAgentId: function(agentId) {
		return this.metric2CiCache.getNumberOfActiveRecordsByAgentId(agentId);
	},
	
	
	/**
	* Get the actual records to get more details
	* @param agentId
	* @return List<Cache.Entry<String, Metric2CiCacheEntry>> 
	*/
	getActiveRecordsByAgentId: function(agentId) {
		return this.metric2CiCache.getActiveRecordsByAgentId(agentId);
	},
	
	/**
	* Print all records for a specific Agent ID
	* @param agentId
	* @return 
	*/
	printRecordsByAgentId: function(agentId) {
		var listOfCacheEntries = this.metric2CiCache.getActiveRecordsByAgentId(agentId);
		for (var i=0; i<listOfCacheEntries.size(); i++) {
			var cacheEntry = listOfCacheEntries.get(i);
			this.__printCacheEntry(cacheEntry);
		}
	},
	
		/**
	* This is a private function for internal use to print the content of Cache Entry
	*/
	__printCacheEntry: function(cacheEntry) {
		ms.log("Cache Entry key: " + cacheEntry.getKey());
		ms.log("Cache Entry value: " + cacheEntry.getValue().toString());
	},
	
	__printModelEntry: function(modelEntry) {
		var modelEntryKey = modelEntry.getKey();
		var modelEntryValue = modelEntry.getValue();
		var classifier = modelEntryValue.getClassifier();
		var expiration = modelEntryValue.getExpirationTime();
		var trainedTime = modelEntryValue.getTrainedTime();
		var ciSysId = modelEntryKey.getCiSysId();
		var metricTypeId = modelEntryKey.getMetricTypeId();
		var resourceId = modelEntryKey.getResourceId();
		var modelInfo = "";
		if (modelEntryValue != null && modelEntryValue.getModel().getTimeSeriesModel() != null) 
			modelInfo = modelEntryValue.getModel().getTimeSeriesModel().toString();
		if (modelEntryValue != null && modelEntryValue.getModel().getLocalLevelKalmanFilterModel())
			modelInfo = modelEntryValue.getModel().getLocalLevelKalmanFilterModel().toString();
		if (modelInfo == "")
			modelInfo = "Empty";
			
		
		ms.log("CI SysId: " + ciSysId + " MetricTypeId: " + metricTypeId + " Classifier: " + classifier + " Expiration time: " + expiration + " Trained time: " + trainedTime + " Model info: " + modelInfo);
	},

	type: "MetricsCacheUtils"
};
