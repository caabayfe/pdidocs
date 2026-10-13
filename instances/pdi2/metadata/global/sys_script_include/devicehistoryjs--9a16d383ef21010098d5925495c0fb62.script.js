// Discovery class

/**
 * A javascript DeviceHistory class to replace the Java class
 * Aleck Lin aleck.lin@servicenow.com
 */

var DeviceHistoryJS = Class.create();

DeviceHistoryJS.prototype = {
    initialize: function() {
        this._scratchpadObj = null;             // lazy-load
        if (typeof source != 'undefined')
            this.source = source;               // exposed by sensorProcessor's method putGlobal
        if (typeof agent_correlator != 'undefined')
            this.status = agent_correlator;     // exposed by sensorProcessor's method putGlobal
        if (typeof sensorName != 'undefined')
            this.sensorName = sensorName;
		if (typeof classification_probe != 'undefined')
            this.classificationProbe = classification_probe;     // exposed by sensorProcessor's method putGlobal
    },

    /**
     * In place of an overloaded constructor.
     */
    reinitialize: function(source, status, classificationProbe) {
        this.setSource(source);
        this.setStatus(status);
		this.setClassificationProbe(classificationProbe);
    },
    
    isValid: function() {
        return JSUtil.notNil(this.source) && JSUtil.notNil(this.status);
    },

    getSource: function() {
        return this.source;
    },

    getStatus: function() {
        return this.status;
    },
	
	getClassificationProbe: function() {
        return this.classificationProbe;
    },
    
    setSource: function(source) {
        this.source = source;
    },

    setStatus: function(status) {
        this.status = status;
    },
	
	setClassificationProbe: function(classificationProbe) {
        this.classificationProbe = classificationProbe;
    },

	getDeviceRecord: function () {
		if (!this.isValid())
            return null;

        var gr = new GlideRecord("discovery_device_history");
        gr.addQuery("status", this.status);
        gr.addQuery("source", this.source);
        gr.addQuery("classification_probe", this.classificationProbe);
        gr.orderBy('sys_created_on');
        gr.query();

        return gr.next() ? gr : null;
    },

    started: function() {
        this._updateDeviceCount("started");
    },

    completed: function() {
        this._updateDeviceCount("completed");
    },

    getScratchpadValue: function(key) {
        if (this._scratchpadObj === null) {
            var dhgr = this.getDeviceRecord();
            if (JSUtil.notNil(dhgr))
                this._scratchpadObj = new JSON().decode(dhgr.scratchpad);
        }
        return ( typeof this._scratchpadObj[key] === 'undefined' ? null : this._scratchpadObj[key] );
    },

    _updateDeviceCount: function(type) {
        // Attempt to update specified count field
        // If the record does not exist the update shall fail
        var mu = GlideMultipleUpdate("discovery_device_history");
        mu.setIncrement(type, 1);
        mu.addQuery('source', this.source);
		mu.addQuery('status', this.status);
		// Adding below condition for credentialless discovery. For credentialless device record,
		// the classification_probe will be empty
		if (JSUtil.notNil(this.classificationProbe))
			mu.addQuery('classification_probe', this.classificationProbe);
		// Adding below condition for credentialless discovery. For credentialless device record,
		// the classification_probe will be empty
		else
			mu.addNullQuery('classification_probe');
        mu.execute();
                    
        // Workaround to force trigger of business rules until we have a real fix.
        // STRY0584514: Optimization
        // We only do this for the final probe completion for a device based on
        // the assumption that we would only need to trigger business rules upon
        // discovery completion of the device, not the starting or completing of
        // individual probes.
        if (type == "completed") {
            var gr = this.getDeviceRecord();
            if (JSUtil.notNil(gr) && (gr.getValue('completed') == gr.getValue('started'))) {
                //reconcile any open errors for this IP
                var source = gr.source;
                var ip = SncIPAddressV4.get(source);
                if (ip)
                    source = ip.toString();
                if (!ip && gr.cmdb_ci && gr.cmdb_ci.ip_address)
                    source = gr.cmdb_ci.ip_address;
                if (DiscoveryErrorsUtilities.useErrorFramework()) {
                    var dStatusId = gr.getValue('status');
                    var dStatusGr = new GlideRecord('discovery_status');
                    if(dStatusGr.get('sys_id', dStatusId))
                        ErrorManager.closeStaleErrorsForKeys(source, dStatusGr.getValue('sys_created_on'));
                } else {
                    var errorManager = new SNC.DiscoveryErrorManager();
                    errorManager.finishKeyInInstance(source+'', gr.status+'');
                }

                gr.sys_updated_on = gs.nowNoTZ();
                gr.update();
            }
        }
    },

    type: 'DeviceHistoryJS'
};
