// Discovery
/**
 * @var DiscoverySensor CimSensor
 * @author Roy Laurie <roy.laurie@service-now.com>
 * @abstract
 */
var CimSensor = Class.create();

CimSensor.PARAMETER_PROBE = 'probe';
CimSensor.PARAMETER_DEVICE_INSTANCE = 'device_instance';
CimSensor.PARAMETER_INSTANCE = 'instance';
CimSensor.PARAMETER_INSTANCE_ID = 'instance_id';
   
CimSensor.Relation = Class.create();
CimSensor.Relation.prototype = {
	initialize: function(fromId, nature, toTable, keys, options) {
		this.fromId = fromId;
		this.toTable = toTable;
		this.keys = keys;
		this.cidata = [];
		this.nature = nature;
		this.options = {
			retireMissing: false,
			direction: 'upstream'
		};
		
		if (typeof options.retireMissing !== 'undefined')
			this.options.retireMissing = ( options.retireMissing === true );
		if (typeof options.direction !== 'undefined')
			this.options.direction = ( options.direction === 'downstream' ? 'downstream' : 'upstream' );
	}
};

CimSensor.prototype = Object.extendsObject(DiscoverySensor, {
	init: function(definition) {
		DiscoverySensor.prototype.init.call(this, definition);
		g_device = this.getDeviceHistoryGlobal();
	},
	
	/**
	 * CIM device history uses a hash of the device's CIMQL identity string and uses that
	 * as the device history source rather than IP, which is used in normal discoveries.
	 * IPs cannot be used here uniquely, as CIM probes query the CIMOM - or CIM Server - which may not
	 * necessarily be the same physical device as
	 * the one we're discovering.
	 * @override DiscoverySensor.prototype.getDeviceHistory
	 * @return DeviceHistoryJS
	 */
	getDeviceHistory: function() {
		var source = this.getInstanceHashToken();
		var status = this.getAgentCorrelator();
		var classificationProbe = g_probe.getParameter('classification_probe');
		var deviceHistory = new DeviceHistoryJS();
		deviceHistory.setSource(source);
		deviceHistory.setStatus(status);
		deviceHistory.setClassificationProbe(classificationProbe);
		return deviceHistory;
	},
	
	getDeviceHistoryGlobal: function() {
		var source = this.getInstanceHashToken();
		var deviceHistory = SncDeviceHistory.createDeviceHistory(source, null, g_probe.getEccQueueId(), g_probe.getParameter('classification_probe'));
		if (deviceHistory === null)	
			throw new DiscoveryException('Unable to determine current Device History for instance `' + source + '`.');

		return deviceHistory;
	},
	
	getInstanceHashToken: function() {
		var instanceToken = new CimInstanceToken(''+this.getParameter(CimSensor.PARAMETER_DEVICE_INSTANCE));
		var hashToken = instanceToken.getHashToken(''+this.getSource());
		return hashToken;
	},	
	
	/**
	 * @override
	 */
	prepare: function() {
		/* @var { name: XMLObj(//cimqueryset/result/instance) } */
		this._queryResults = null;
		/* @var { probe key: {instance: XMLObj(), cidata: CIData} } */
		this._triggeredBatches = {};
		/* @var { probe key: {id:string} } */
		this._triggeredProbes = {};
		/* @var { name: CimSensor.Relation } */
		this._related = {};
	},
	
	/**
	 * Processes CIM Probe query results and updates ci/gr data where needed.
	 * @override
	 * @param { name: XMLObj(//cimquery/result/instance)[],.. } results
	 * @param string instanceId The ID of the probed CIM instance.
	 * @param string deviceId The ID of the classified device.
	 * @param string instanceToken The probed instance's CIM query token.
	 * @param string deviceToken The classified device's CIM query token.
	 * @param {} current Updates the g_device with injected fields at end of probe cycle.
	 * @throws DiscoveryException On error
	 */
	processCimLegacy: function(results, instanceId, deviceId, instanceToken, deviceToken, current) {
		throw new DiscoveryException('CimSensor.processCim() needs to be overridden in sensor `' + this.getSensorName() + '`.');
	},
	
	/**
	 * Processes CIM Probe query results and updates ci/gr data where needed.
	 * @override
	 * @param { string queryName:{string propertyName:string value}[] cimObjects} results
	 * @param Ci deviceCi
	 * @throws Error
	 */
	processCim: function(results, deviceCi) {
		throw new DiscoveryException('CimSensor.processCim() needs to be overridden in sensor `' + this.getSensorName() + '`.');
	},
	
	/**
	 * Calls processCim().
	 * @override
	 * @param XMLObj(//result) probeResult
	 * @throws DiscoveryException On error.
	 */
	process: function(probeResult) {
		try {
			this._queryResults = this._prepareQueryResults(probeResult);
			this._deviceId = ''+this.getCmdbCi();
			this._deviceToken = ''+this.getParameter(CimSensor.PARAMETER_DEVICE_INSTANCE);
			this._instanceId = ''+this.getParameter(CimSensor.PARAMETER_INSTANCE_ID);
			this._instanceToken = ''+this.getParameter(CimSensor.PARAMETER_INSTANCE);
			
			if (typeof this.versionEra === 'undefined' || this.versionEra === 'fuji')
				this.processCim(this._queryResults, this.getDeviceCi());
			else
				this.processCim(this._queryResults, this._instanceId, this._deviceId, this._instanceToken, this._deviceToken, current);				
		} catch (e) {
			throw new DiscoveryException('CIM Sensor error: ' + e, e);
		}
	},
   
	sha1: function(data) {
		return ''+Packages.org.apache.commons.codec.digest.DigestUtils.shaHex(data);
	},
	
	defineRelation: function(name, fromId, nature, toTable, keys, options) {
		if (this._related[name] === undefined)	
			this._related[name] = new CimSensor.Relation(fromId, nature, toTable, keys, options);

		return this._related[name];
	},
	
	defineInstanceRelation: function(name, nature, toTable, keys, options) {
		return this.defineRelation(name, this._instanceId, nature, toTable, keys, options);
	},
	
	defineDeviceRelation: function(name, nature, toTable, keys, options) {
		return this.defineRelation(name, this._deviceId, nature, toTable, keys, options);
	},
	
	addRelated: function(relationName, cidata) {
		if (this._related[relationName] === undefined)
			throw new IllegalArgumentException('CIData relation `' + relationName + '` undefined.');
				
		this._related[relationName].cidata.push(cidata);
		return cidata;
	},
	
	defineTriggeredProbe: function(key, probeName) {
		var probeCache = new SNC.ProbeCache();
		var probeRecord = probeCache.getByName(probeName);
		
		if (!probeRecord)
			throw new IllegalArgumentException('Unknown triggered probe `' + probeName + '`.');
		
		this._triggeredProbes[key] = {
			id: ''+probeRecord.sys_id
		};

		return this._triggeredProbes[key];
	},
	
	triggerBatch: function(probeKey, instance, cidata) {
		if (typeof this._triggeredBatches[probeKey] === 'undefined')
			this._triggeredBatches[probeKey] = [];
		
		this._triggeredBatches[probeKey].push({
			instance: instance,
			cidata: cidata
		});
	},
	
	/**
	 * Retrievs all CIM query result sets, mapped by query name.
	 * @return { name: XMLObj(//cimqueryset/result/instance) }
	 */
	getQueryResults: function() {
		return this._queryResults;
	},
		
	/**
	 * Retrieves a CIM query result set of CIM instances by query name.
	 * @param string name
	 * @return null|XMLObj(//cimqueryset/result/instance)
	 */
	getQueryResult: function(name) {
		return this._queryResults[name];
	},
	
	getProbeId: function() {
		return this.getParameter(CimSensor.PARAMETER_PROBE);
	},
	
	/**
	 * @param XMLObj(//result) probeResult 
	 * @return { name: XMLObj(//cimqueryset/result/instance) }
	 */
	_prepareQueryResults: function(probeResult) {
		var namedQueries = new CimProbe(this.getProbeId()).getNamedStatements();
		var cimProbeResult = new CimProbeResult(probeResult);
		return cimProbeResult.getNamedInstances(namedQueries);
	},
	
	after: function() {
		this._reconcileRelations();
		this.afterReconcile();
		this._fireTriggeredProbes();
	},
	
	/**
	 * Called during CimSensor.after(), after relationships are saved, before probes are triggered.
	 * @abstract
	 */
	afterReconcile: function() {
	},
	
    /**
     * Reconciles relationships created by addBatch().
     */
	_reconcileRelations: function() {
		// lock against this CI and probe, prevent sync issues between multiple results for the same probe
		var mutexMetricName = 'CimSensor';
		var key = this.sha1(this._deviceId + '::' + this.getProbeId());
		var mutex = new SelfCleaningMutex(key, mutexMetricName);
		mutex.setSpinWait(200); // 200 ms
		mutex.setMaxSpins(1500); // 5 mins
		if (mutex.get()) {
			try {
				for (var name in this._related) {
					var relation = this._related[name];
					
					var reconcilerOptions = {
						fromId: relation.fromId,
						nature: relation.nature,
						toTable: relation.toTable,
						cidata: relation.cidata,
						keys: relation.keys,
						retireMissing: relation.options.retireMissing,
						type: this.type,
						direction: relation.options.direction
					};
					
					var reconciler = new DiscoveryCIRelationReconciler(reconcilerOptions);
					reconciler.reconcile();
				}
			} finally {
				mutex.release();
			}
		} else {
			gs.logError('Unable to lock on CimSensor mutex for: ' + this._deviceId + '::' + this.getProbeId());
		}
	},
	
	/**
	 * Retrieves all triggered probe IDs for this sensor. Does not use ASensor.
	 * TODO: Alter _fireTriggeredProbes to use this method.
	 * @returns [string]
	 */
	_getTriggeredProbeIDs: function() {
		var gr = new GlideRecord('discovery_sensor_probe');
		gr.addQuery('sensor', sensorId); // global sensorId set by ASensor
		gr.query();
		
		var probeIds = [];
		while (gr.next())
			probeIds.push(''+gr._probe);
		
		return probeIds;
	},
	
	_fireTriggeredProbes: function() {
		for (var key in this._triggeredProbes) {
			var probeMeta = this._triggeredProbes[key];
			var batches = this._triggeredBatches[key];
			if (gs.nil(batches))
				continue;
			
			for (var bi = 0, bn = batches.length; bi < bn; ++bi) {
				var batch = batches[bi];
				var instanceId = gs.nil(batch.cidata.data.sys_id) ? null : batch.cidata.data.sys_id;
				var probe = Probe.getById(probeMeta.id);
				if (!probe)
					throw new IllegalArgumentException('Probe `' + probeMeta.id + '` not found.');

				var parameters = {
					source: this.getSource(),
					port: ''+this.getParameter('port'),
					sys_id: this._deviceId,
					ecc_breadcrumbs: ''+this.getEccQueueId(),
					device_instance: this._deviceToken,
					namespace: batch.instance._namespace,
					instance:  CimInstanceToken.parse(batch.instance),
					instance_id: instanceId
				};

				for (var name in parameters)
					probe.addParameter(name, parameters[name]);
				
				probe.setSource(parameters.source);
				new ProbeHandlerCim(probe).run();
				probe.create(this.getAgent(), this.getEccQueueId());			
			}
		}
	},
	
    type: 'CimSensor'
});
