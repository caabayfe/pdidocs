/** 
 * Classifies systems based on results returned from a CIM classification probe.
 * @author roy.laurie
 */
var DiscoveryCimClassificationSensor = Class.create();

DiscoveryCimClassificationSensor.prototype = Object.extendsObject(DiscoverySensor, {
    prepare: function() {
		try {
	       if (g_device === null || g_device.getCmdbCi())
		       return;

			// Trigger any additional classifiers against g_device.  The server will
			// remain in "classifying" if I don't do this.
			this.fireAdditionalClassifier();
        } catch (e) {
            this.processError(''+e);
		}
    },
   
	/**
	 * @override
	 * @param XMLObj probeResult
     */
    process: function(probeResult) {
		try {
	        this._initializeCimSensor(probeResult);
	        this._processClassifier();
		} catch (e) {
            this.processError(''+e);
		}
    },
    
	/**
     * @param XMLObj probeResult
	 */
    _initializeCimSensor: function(probeResult) {
        this._cimQueries = new CimProbeResult(probeResult).getQueries();
		this._cimInstances = [];
    },	
	
	_processClassifier: function() {
		var classificationRecords = this._getCimClassificationRecords();
		var i = 1;
		while (classificationRecords.next()) {
			// skip disabled classifiers
			if (!classificationRecords.disabled)
				this._processClassification(classificationRecords);
		}
	},

	/**
	 * @return GlideRecord(discovery_classy_cim) All active CIM classifications.
	 */
	_getCimClassificationRecords: function() {
		var classifications = new GlideRecord('discovery_classy_cim');
		classifications.addActiveQuery();
		classifications.query();
		return classifications;
	},
	
	/**
	 * @param GlideRecord(discovery_class_cim) cimClassification
	 * @return GlideRecord(discovery_class_criteria) All active Criteria for the specified CIM Classification.
	 */
	_getCriteriaRecords: function(cimClassification) {
		var criteria = new GlideRecord('discovery_class_criteria');
		criteria.addActiveQuery();
		criteria.addQuery('classy', ''+cimClassification.sys_id);
		criteria.query();
		return criteria;
	},	
	
	/**
	 * @param GlideRecord(discovery_classy_cim) classificationRecord
	 * @throws AutomationException On error from Classification Script
	 */
	_processClassification: function(classificationRecord) {
		var cimCriteriaQueryMap = this._mapCriteriaToCimQueries(classificationRecord);
		var script = ''+classificationRecord.script;
		var table = ''+classificationRecord.table;
		var instanceInputs = null;
		if (!gs.nil(script)) {
			try {
				instanceInputs = this._runOnClassificationScript(script, cimCriteriaQueryMap, table);
			} catch (e) {
				gs.log(e.toString());
				throw new AutomationException('Error in onClassification script for Classification `' + classificationRecord.name + '`. ' + e);
			}
		} else {
			instanceInputs = this._getAllCriteriaInstanceInputs(cimCriteriaQueryMap, table);
		}
			
		var deviceHistory = this.getDeviceHistory();
		var deviceHistorySysId = deviceHistory.getDeviceRecord();
		deviceHistorySysId = deviceHistorySysId && ('' + deviceHistorySysId.sys_id);

		for (var i = 0, n = instanceInputs.length; i < n; ++i) {
			var input = instanceInputs[i];
			
			// discoveryData.freezeDeviceHistory can be used to maintain the current IP-based Discovery Status Source and Device History
			if (!input.discoveryData.freezeDeviceHistory)
				// create a new device history for this "representation" of a device
				this._createCimDeviceHistory(classificationRecord, input.instance, deviceHistorySysId);
		}
	   
		this._fireCimProbes(classificationRecord, instanceInputs);
		
		if (!this.getParameter('is_supplementary')) {
			var ipsa = new IPServiceAffinity(this.getSource(), this.getParameter('port'));		
			ipsa.setIPServiceAffinity();
		}
	},
	
	/**
	 * @return DeviceHistory
	 * @throws DiscoveryException
	 */
	_createCimDeviceHistory: function(classificationRecord, instanceToken, deviceHistorySysId) {
		var source = new CimInstanceToken(instanceToken).getHashToken(this.getSource());
		var deviceHistory = SncDeviceHistory.createDeviceHistory(source, null, g_probe.getEccQueueId(), g_probe.getParameter('classification_probe'));
		if (deviceHistory === null)	
			throw new DiscoveryException('Unable to determine current Device History for instance `' + source + '`.');

	    deviceHistory.setScratchpadValue('sourceIP', this.getSource());
		deviceHistory.setScratchpadValue('cimInstance', instanceToken);
		deviceHistory.setScratchpadValue('parentDeviceHistorySysId', deviceHistorySysId);
		
	    deviceHistory.setClassifiedAs(''+classificationRecord.table);
		return deviceHistory;
	},
   
	/**
	 * @param GlideRecord(discovery_classy_cim) classificationRecord
	 * @return { criteria.name : XMLObj(//cimqueryset/cimquery},.. }
	 * @throws IllegalArgumentException If any criterion cannot be mapped.
	 */
	_mapCriteriaToCimQueries: function(classificationRecord) {
		var classificationCimQueries = {};
		var criteriaRecords = this._getCriteriaRecords(classificationRecord);
		while (criteriaRecords.next()) {
			var name = ''+criteriaRecords.name;
			var cimQuery = this._findCimQuery(''+criteriaRecords.criterion, this._cimQueries);

			classificationCimQueries[name] = cimQuery;
		}

		return classificationCimQueries;
	},		

	/**
	 * @param string query
	 * @param XMLObj(//cimqueryset/cimquery[]) classificationCimQuery
	 * @return null|XMLObj(//cimqueryset/cimquery)
	 */
	_findCimQuery: function(query, classificationCimQuery) {
		for (var i = 0, n = classificationCimQuery.length; i < n; ++i) {
			if (classificationCimQuery[i].query == query)
				return classificationCimQuery[i];
		}
		
		return null;
	},

	/*
	 *
	 */
	_findCimQueryByName: function(name) {
		var i,
			queries = this._cimQueries;

		for (i = 0; i < queries.length; i++) {
			if (queries[i].name == name)
				return queries[i];
		}
	},

	/************************************************************************************************************************
	 * Validates a single classification criterion result. Processed against all criteria results one by one.
	 * @param string name The Classification Criteria Name of the query.
	 * @param XMLObj(//cimqueryset/cimquery/result/instance) instance The instance returned. Valid. Format:
	 *   {_key: {string:string,..}, _namespace: string, _classname: string, _cidata: {string:string,..}, {MyProp:string},..}
	 * @param CIData cidata The CIData for this instance. Pre-set with 'sys_class_name'.
	 * @param { criteria.name: XMLObj(//cimqueryset/cimquery/result/instance[]),.. } results 
	 * @param Object uniqueInstance   A javascript object that will be passed to all results for the same instance.
	 *                                When there are multiple queries, the classification script can be called more than
	 *                                once for the same object, e.g. a storage server that supports both the NAS and
	 *                                Array profiles.  When this happens the script will be called more than once, but
	 *                                this parameter will be the same for all calls.
	 * @return true|false|XMLObj(//cimqueryset/cimquery/result/instance) Return the instance if approved, false to skip,
	 *                                                                   true to approve the uniqueInstance parameter (you
	 *                                                                   can approve the uniqueInstance any number of times
	 *                                                                   and it will only be explored once.)
	 *
	 * Operating on the uniqueInstance and returning true or false is the best practice.  The "instance" parameter is retained
	 * only for backward compability.
	 */ /*
	function classify(name, instance, cidata, results, uniqueInstance) {
		return true;
	} */
	
	/**
	 * Executes the associated CIM Classification Filter Function defined as demonstrated above.
	 * @param string script The script body to run
	 * @param { criteria.name : XMLObj(//cimqueryset/cimquery),.. } cimCriteriaQueryMap
	 * @param string table
	 * @return [{ namespace: string, instance: string, cidata: {string:string,..} }
	 */
	_runOnClassificationScript: function(script, cimQueries, table) {
		var name, name2, i, instances, instance, instanceInput, result, id, communicationMechanism,
			multipleOperationsSupported = false,
			onClassificationFunction = new Function('name', 'instance', 'queries', 'uniqueInstance', 'return (' + script + '(name, instance, queries, uniqueInstance));'),
			instanceMap = { },
			instanceInputs = [];

		try {
			communicationMechanism = this._findCimQueryByName('XMLCommunicationMechanism');
			multipleOperationsSupported = communicationMechanism.result.instance[0].MultipleOperationsSupported.toLowerCase() == 'true';
		} catch (e) { }

		for (name in cimQueries) {
			instances = cimQueries[name] && cimQueries[name].result.instance;
			if (!instances)
				continue;

			for (i = 0, n = instances.length; i < n; ++i) {

				instance = instances[i];

				id = instance._path + '**' + instance.ElementName;

				if (!instanceMap[id]) {
					instanceInput = {
						namespace: instance._namespace,
						instance: this._cimInstanceToQuery(instance),
						multipleOperationsSupported: multipleOperationsSupported,
						cidata: new CIData(),
						_discoveryData: { }
					};

					for (name2 in instance)
						instanceInput._discoveryData[name2] = instance[name2];

					instanceMap[id] = instanceInput;
					instanceInput.cidata.data.sys_class_name = table;
					instanceInput.discoveryData = instanceInput._discoveryData;
				}

				instanceInput = instanceMap[id];

				instance._cidata = instanceInput.cidata;
				instance._discoveryData = instanceInput._discoveryData;

				result = onClassificationFunction(name, instance, cimQueries, instanceInput);
				
				if (result) {
					if (result === true) {
						if (!instanceInput._pushed) {
							instanceInput._pushed = true;
							instanceInputs.push(instanceInput);
						}
					}
					else
						instanceInputs.push(result);
				}
			}
		}

		return instanceInputs;
	},
	
	/**
	 * @param XMLObj(//cimqueryset/cimquery/result/instance) cimInstance
	 * @return string e.g., CIM_ClassName{Key1='Value1', Key2='Value2'}
	 */
	_cimInstanceToQuery: function(cimInstance) {
		var identity = '';
		for (var name in cimInstance._key)
			identity += name + "='" + cimInstance._key[name] + "',";
		
		identity = identity.substr(0, identity.length - 1); // trim trailing ,
		var query = cimInstance._classname + '{' + identity + '}';
		return query;
	},
	
	/**
	 * Returns CIM Probe Instance Inputs for all results, without filter. Used when no onClassification script
	 * is specified.
	 * @param { string : XMLObj(//cimqueryset/cimquery},..}
	* @return [{ namespace: string, instance: string, cidata: {string:string,..} }]
	 */
	_getAllCriteriaInstanceInputs: function(cimCriteriaQueryMap, table) {
		var instanceInputs = []; // use all instance results from the query map
		for (var name in cimCriteriaQueryMap) {
			var instance = cimCriteriaQueryMap[name].result.instance;
			var input = {
				namespace: instance._namespace,
				instance: this._cimInstanceToQuery(instance),
				cidata: new CIData()
			};
			
			input.cidata.data.sys_class_name = table;
			instanceInputs.push(input);
		}
		
		return instanceInputs;
	},
	
	/**
	 * @param GlideRecord(discovery_classy_cim) classificationRecord
	 * @param { namespace: string, instance: string, cidata: {string:string,..} }[] instanceInputs
	 */
	_fireCimProbes: function(classificationRecord, instanceInputs) {
		var parameters = {
			source: this.getSource(),
			port: ''+this.getParameter('port'),
			classifier: ''+classificationRecord.sys_id,
			port_probe: ''+this.getParameter('port_probe'),
			ecc_breadcrumbs: ''+this.getEccQueueId(),
			triggered_probes: null,
			namespace: null,
			instance: null,
			device_instance: null,
			cidata: null
		};
		
		var classer = new DiscoveryClassification();
		var pattern = classer.getPaternNameFromProbe(true, classificationRecord.child, classificationRecord.classy);
		
		if (pattern) {
			parameters.pattern = pattern;
			
			var affinity = classer.getCredentialAffinity(this.getSource());
			if (affinity)
				parameters.affinity = affinity;
				
  			_fireCimProbe(classifier, parameters);
			return;
		}
		
		var identityProbes = this.getTriggeredProbes(classificationRecord, 'Identification');
		var explorationProbes = this.getTriggeredProbes(classificationRecord, 'Exploration');
		
		for (var ip = 0; ip < identityProbes.length; ++ip) {
			for (var ii = 0; ii < instanceInputs.length; ++ii) {
				var instanceInput = instanceInputs[ii];

				// validate triggered probe conditions for this instance
				var explorationProbeIds = this.validateTriggeredProbeConditions(explorationProbes, instanceInput.discoveryData);
				
				// configure probe parameters
				parameters.namespace = instanceInput.namespace;
				parameters.instance = instanceInput.instance;
				parameters.device_instance = instanceInput.instance;
				parameters.cidata = instanceInput.cidata.toXML();
				parameters.triggered_probes = explorationProbeIds.join(',');
				parameters.multipleOperationsSupported = instanceInput.multipleOperationsSupported || false;
				
				// if discoveryData.freezeDeviceHistory wasn't set, trace the parent device history
				if (!instanceInput.discoveryData.freezeDeviceHistory)
					parameters.relate_discovered_to_discovers = 'true';

				var identityProbeIds = this.validateTriggeredProbeConditions([ identityProbes[ip] ], instanceInput.discoveryData);
				if (identityProbeIds.length)
					this._fireCimProbe(identityProbeIds[0], parameters);
			}
		}
	},
	
	/**
	 * Enqueues a CIM Probe run.
	 * @param string id
	 * @param {string:string,..} parameters
	 */
	_fireCimProbe: function(id, parameters) {
		var probe = Probe.getById(id);
		if (!probe)
			throw new IllegalArgumentException('Probe `' + id + '` not found.');
		
		probe.setSource(this.getParameter('source'));
		probe.setEccPriority(this.getParameter('priority'));
		probe.setMidSelectDetails(this.getParameter('mid_selector_details'));
		
		for (var name in parameters)
			probe.addParameter(name, parameters[name]);
			
		probe.create(this.getAgent(), this.getEccQueueId());
	},
	
	/**
	 * Retrieves the triggered probe IDs for the given classifier and phase.
	 * Validates conditions scripts.
	 * @param GlideRecord(discovery_classy_cim)
	 * @param string phase (Optional)
	 * @return {}[] JS obj of discovery_classifier_probe
	 */
	getTriggeredProbes: function(classificationRecord, phase) {
		var m2m = new GlideRecord('discovery_classifier_probe');
		m2m.addQuery('classy', ''+classificationRecord.sys_id);
		if (!gs.nil(phase))
			m2m.addQuery('phase', phase);

		m2m.addActiveQuery();
		m2m.query();
		var triggeredProbes = [];
		while (m2m.next()) {
			
			triggeredProbes.push({
				sys_id: ''+m2m.child,
				condition_script: ( gs.nil(m2m.condition_script) ? null : ''+m2m.condition_script ),
			});
		}

		return triggeredProbes;
	},
	
	validateTriggeredProbeConditions: function(triggeredProbes, discoveryData) {
		var passedProbes = [];
		for (var i = 0; i < triggeredProbes.length; ++i) {
			var probe = triggeredProbes[i];
			
			if (probe.condition_script === null) {
				passedProbes.push(probe.sys_id);
				continue;
			}
			
			// pass discoveryData twice; it will be re-used as values
			var funcstr = 'return ( function validate(discoveryData, values) { return ( ' + probe.condition_script + ' ); } )(discoveryData, values);';
			var conditionFunc = new Function('discoveryData', 'values', funcstr);
			try {
				if (conditionFunc.call(discoveryData, discoveryData) === true)  {
					passedProbes.push(probe.sys_id);
					passed = true;
				}
			} catch (e) {
				gs.logError('Error in classification probe conditional script: ' + e);
			}
		}
		
		return passedProbes;
	},

    type: 'DiscoveryCimClassificationSensor'
});
