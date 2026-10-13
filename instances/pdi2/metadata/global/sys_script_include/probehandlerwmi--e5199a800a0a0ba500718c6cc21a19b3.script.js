// Discovery Probe Handler for the WMI probes

gs.include("PrototypeServer");

var ProbeHandlerWMI = Class.create();

ProbeHandlerWMI.prototype = {

    initialize: function(probe) {
        this.probe = probe;
    },

    run: function() {
        this.probe.setTopic("WMIRunner");
        var params = this.getParameters();
        this.setProbeParameters(params);
    },

    /*
     * Returns a hash map of the parameters added by this probe handler.
     */
    getParameters: function() {
        var result = {};
        result['WMI_FetchData'] = this.getWMIFields();
        return result;
    },

    setProbeParameters: function(params) {
        for (var name in params)
            this.probe.addParameter(name, params[name]);
    },

    /*
     * Generate a string containing the WMI fields to fetch
     */
    getWMIFields: function() {
        var wmiFields = [];
        var fgr = new GlideRecord("discovery_probes_wmi_field");
        fgr.addQuery("probe", this.probe.getId());
        fgr.addActiveQuery();
        fgr.query();
        while (fgr.next()) {
            var result = SncDiscoveryCodeSigningUtil.isRecordTrusted('discovery_probes_wmi_field', fgr.getUniqueValue(), 'ecc_queue');
            if (result)
                wmiFields.push('' + fgr.wmi_path);
        }

        return wmiFields.join();
    },

    type: 'ProbeHandlerWMI'
}
