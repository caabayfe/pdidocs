// Discovery
/**
 * Performs identification for CIM probe results.
 * @author roy.laurie
 */
var CimIDSensor = Class.create();

CimIDSensor._ATTRIBUTE_ID = '@id';
CimIDSensor.PARAMETER_SYS_ID = 'sys_id';
CimIDSensor.PARAMETER_INSTANCE = 'instance';
CimIDSensor.PARAMETER_INSTANCE_ID = 'instance_id';
CimIDSensor.PARAMETER_NAMESPACE = 'namespace';
CimIDSensor.PARAMETER_DEVICE_INSTANCE = 'device_instance'

CimIDSensor.prototype = Object.extendsObject(DiscoveryIDSensor, {
	init: function(definition) {
		DiscoverySensor.prototype.init.call(this, definition);
		
		// use a device history just for this device within the CIMOM, unless it's the actual CIMOM itself
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
		deviceHistory.getDeviceRecord();
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
		var instanceToken = new CimInstanceToken(''+this.getParameter(CimIDSensor.PARAMETER_INSTANCE));
		var hashToken = instanceToken.getHashToken(''+this.getSource());   
		return hashToken;
	},
	
	prepare: function() {
		DiscoveryIDSensor.prototype.prepare.call(this);
	},
	
	/**
	 * Process all CIM Probe query results for a CIM ID Sensor.
	 * @param { name: [XMLObj(//cimqueryset/cimquery/result/instance)],.. } results
	 * @param CimCIData cimdata The CI data of the device being identified.
	 * @param CimIDSensor sensor This wrapping sensor (extends CimIDSensor).
	 * @throws DiscoveryException On error
	 */ /*
	function process(results, cimdata, sensor) {
	} */
	
	/**
	 * Runs a multi-probe script against a probe result. The function declaration is ahove.
	 * @param string script
	 * @param XMLObj(//result/results/result) probeResult
	 * @param string probeId
	 * @override
	 * @throws DiscoveryException On error.
	 */
	runMultiProbeScript: function(script, probeResult, probeRecord) {
		try {
			var queryResults = this._prepareQueryResults(probeResult, ''+probeRecord.sys_id);
			var multiprobeFunction = new Function('results', 'cimdata', 'sensor', 'return (' + script + '(results, cimdata, sensor));');
			var cimdata = new CimCIData(this.ciData);
			multiprobeFunction(queryResults, cimdata, this);
		} catch (e) {
			throw new DiscoveryException('CIM MultiProbe script for probe `' + probeRecord.name + '` failed. ' + e, e); 
		}
	},	
	
	/**
	 * Parses a CIM Probe result and returns all result instances, mapped by query name.
	 * @param XMLObj(//result) probeResult
	 * @return { name: XMLObject(//cimqueryset/result/instance) }
	 */
	_prepareQueryResults: function(probeResult, probeId) {
		var namedQueries = new CimProbe(probeId).getNamedStatements();	
		var cimProbeResult = new CimProbeResult(probeResult);
		return cimProbeResult.getNamedInstances(namedQueries);
	},
	
	/**
	 * Configure a triggered probe before it is launched.
	 * @param Probe probe Already configured and ready to fire.
	 * @return boolean Return TRUE to fire this probe, FALSE to skip it.
	 * @override
	 */	
	configureTriggeredProbe: function(probe) {
	    probe.addParameter(CimIDSensor.PARAMETER_SYS_ID, ''+this.getCmdbCi());
		probe.addParameter(CimIDSensor.PARAMETER_DEVICE_INSTANCE, this.getParameter(CimIDSensor.PARAMETER_INSTANCE));
		probe.addParameter(CimIDSensor.PARAMETER_INSTANCE, this.getParameter(CimIDSensor.PARAMETER_INSTANCE));
		probe.addParameter(CimIDSensor.PARAMETER_NAMESPACE, this.getParameter(CimIDSensor.PARAMETER_NAMESPACE));
	    probe.addParameter(CimIDSensor.PARAMETER_INSTANCE_ID, ''+this.getCmdbCi());
	    probe.addParameter('multipleOperationsSupported', this.getParameter('multipleOperationsSupported'));
		new ProbeHandlerCim(probe).run();
		return true;
	},

    updateDeviceCount: function() {
        DiscoveryIDSensor.prototype.updateDeviceCount.call(this);
        var history = DeviceHistory.getFromSourceAndStatusAndClassification(this.getSource(), this.getEccQueueId(), g_probe.getParameter('classification_probe'));
        if (history !== null)
            history.completed();
    },
	
	relateDiscoveredToDiscovers: function(discoveredSysId, discoversSysId) {
		if (gs.nil(discoversSysId)) {
			// determine the parent history id
			var deviceHistory = this.getDeviceHistory();
			var deviceHistorySysId = ''+deviceHistory.getDeviceRecord().sys_id;
			var parentHistoryId = deviceHistory.getScratchpadValue('parentDeviceHistorySysId');
			if (parentHistoryId === null)
				return;
			
			// create the encoded JSON string to search for all sibling histories for the same parent
			var scratchPadStr = '"parentDeviceHistorySysId":"' + parentHistoryId + '"';
			var discoveryStatusSysId = this.getAgentCorrelator();
	
			// find the device histories that come from the same parent
			var historiesGr = new GlideRecord('discovery_device_history');
			historiesGr.addQuery('sys_id', '!=', deviceHistorySysId); // ignore current history history
			historiesGr.addQuery('status', discoveryStatusSysId); // match against current status
			historiesGr.addQuery('scratchpad', 'CONTAINS', scratchPadStr); // only child histories
			var cp = deviceHistory.getClassificationProbe();
			if (cp)
				historiesGr.addQuery('classification_probe', cp);
			historiesGr.query();
			
			// find the history that created the WBEM Service CI
			discoversSysId = null; // populate this ...
			while (historiesGr.next()) {
				if (historiesGr.cmdb_ci.sys_class_name == 'cmdb_ci_wbem_service') {
					discoversSysId = ''+historiesGr.cmdb_ci.sys_id;
				}
			}
			
			// skip if we did not find the WBEM Service CI
			if (gs.nil(discoversSysId))
				return;
		}
		
		// get the relationship type for later
		var relTypeId = g_disco_functions.findCIRelationshipTypeByDesc('cmdb_rel_type', 'Discovers', 'Discovered from');
		if (relTypeId === '')
			throw 'Unable to find Discovers::Discovered from relationship type';
		
		// determine if we need to create a relationship or not, which requires a mutex
		var existingGr = new GlideRecord('cmdb_rel_ci');
		existingGr.addQuery('parent', discoversSysId); // wbem service
		existingGr.addQuery('type', relTypeId); // discovered :: discovers
		existingGr.addQuery('child', discoveredSysId);
		existingGr.query();
		
		if (existingGr.hasNext())
			return;
		
		// lock on insert, to prevent dupes between discovered and discovers sensor race conditions
		var key = 'discoveredToDiscovers:' + discoversSysId;
		var mutexMetricName = 'CimIDSensor';
		var mutex = new SelfCleaningMutex(key, mutexMetricName);
		mutex.setSpinWait(200); // 200 ms
		mutex.setMaxSpins(1500); // 5 mins
		
		if (mutex.get()) {
			// re-query after the lock
			existingGr.query();
			if (existingGr.hasNext())
				return;
			
			try {
				var relGr = new GlideRecord('cmdb_rel_ci');
				relGr.parent = discoversSysId;
				relGr.type = relTypeId;
				relGr.child = discoveredSysId;
				relGr.insert();
			} finally {
				mutex.release();
			}
		} else {
			this.warn('Unable to create to lock on CimSensor mutex for: ' + key);
		}
	},
	
	after: function() {
		DiscoveryIDSensor.prototype.after.apply(this, arguments);

		// relate discovered to discovers
		if (this.getParameter('relate_discovered_to_discovers') != 'true')
			return;

		// CISysID is set after either a successful identify() or insert()
		this.relateDiscoveredToDiscovers(''+this.CISysID);
	},

	type: 'CimIDSensor'
});
