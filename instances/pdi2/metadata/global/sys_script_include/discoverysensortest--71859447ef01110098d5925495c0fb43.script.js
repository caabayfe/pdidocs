var DiscoverySensorTest = Class.create();

DiscoverySensorTest.prototype = {
    initialize: function(payload) {
		this._setup(payload);
		this.fDebug = false;
    },

	getResults: function() {
		this.debug("The following field and value pairs are what the sensor will update");
		var statements = [];
		for (var name in current)
			statements.push(name + " ==> " + current[name]);
		
		return statements.join("\n");
	},
	
	getCurrent: function() {
		return current;
	},
	
	setDebug: function(flag) {
		fDebug = flag;	
	},
	
	_setup: function(payload) {
		gs.include("DiscoveryIncludes");
		
		// Set up up ECC Queue Record
		var eccQGr = new GlideRecord("ecc_queue");
		eccQGr.topic = "SensorTest";
		eccQGr.name = "SensorTest";
		eccQGr.source = "127.0.0.1";
		
		// create a daily discovery_status only if sensor debug property is set
		if (gs.getProperty("glide.discovery.sensors.debugging", "false") == "true")
			eccQGr.agent_correlator = this._getStatusID();
		
		var payloadXML = this._buildPayload(payload);
		eccQGr.payload = payloadXML;
		
		var sensorECCQID = eccQGr.insert();
		this._debug("The ECC queue input record created is " + sensorECCQID);
		
		// Expose necessary globals
		// See Probe.java::expose() for the (partial?) list of globals exposed to sensors
		g_probe = SncProbe.createProbeResponse(eccQGr);
		// Avoid calls to Probe.expose() from JS except for special situations.
		g_probe.expose();
		topic = '';
		g_device = {};
		g_sensor = {};
		current = {};
		g_mockSensor = true;
		document = new XMLHelper().toObject(payloadXML);		
	},
	
	_buildPayload: function(payload) {
		if (JSUtil.nil(payload))
			return "";
		else if (payload.indexOf('</results>') > 0)
			return payload;
		
		var parameters = {};
		parameters["agent_correlator"] = this._getStatusID();		

		var paramStr = '';
		for (var name in parameters) {
			value = parameters[name];
			paramStr += '<parameter name="' + name + '" value="' + value + '"/>'  
		}
		
		if (payload.indexOf('</result>') > 0)
			return '<?xml version="1.0" encoding="UTF-8"?><results>' +
				payload +
				'<parameters>' + paramStr + '</parameters>' +
				'</results>';
		
		return '<?xml version="1.0" encoding="UTF-8"?><results>' +
				'<result><output>' + payload + '</output></result>' +
				'<parameters>' +			
				paramStr +
				'</parameters>' +
				'</results>';
	},
	
	/*
	*	We just need to pass in stub discovery status sys_id
	*/
	_getStatusID: function() {
		var gr = new GlideRecord("discovery_status");
		gr.addQuery('sys_created_onONToday@javascript:gs.daysAgoStart(0)@javascript:gs.daysAgoEnd(0)');
		gr.addQuery('description', 'Sensor Testing');
		gr.query();
		if (gr.next())
			return gr.sys_id;
		
		gr.initialize();
		gr.description = 'Sensor Testing';
		gr.state = 'Completed';
		return gr.insert();
	},
	
	_debug: function(msg) {
		if (this.fDebug)
		  gs.log(msg);
	},
	

    type: 'DiscoverySensorTest'
}
