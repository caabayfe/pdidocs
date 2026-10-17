// Discovery Probe Handler for SNMP probes

gs.include("PrototypeServer");

var ProbeHandlerSNMP = Class.create();

ProbeHandlerSNMP.prototype = {
    initialize: function(probe) {
        this.probe = probe;
        this.probeGR = new GlideRecord('discovery_probes_snmp');
        this.probeGR.get(this.probe.getParameter('probe'));
    },

    run: function() {
        var params = this.getParameters();
        this.setProbeParameters(params);
    },

    /*
     * Returns a hash map of the parameters added by this probe handler.
     */
    getParameters: function() {
        var result = {};
        this.addOIDSpec(result);
        this.addStage(result);
        this.addTimingSpecs(result);
        this.addDebug(result);
        this.addOIDAutoResolve(result);
        this.addSensorHandler(result);
        this.addJavascriptHandlers(result);
        this.addVersionProtocols(result);
        return result;
    },

    setProbeParameters: function(params) {
        for (var name in params)
            this.probe.addParameter(name, params[name]);
    },

    addOIDSpec: function(param_map) {
        var lines = [];
        var specsGR = new GlideRecord('discovery_probes_snmp_field');
        specsGR.addQuery('probe', this.probeGR.getValue('sys_id'));
        specsGR.addActiveQuery();
        specsGR.query();
        while (specsGR.next()) {
            var result = SncDiscoveryCodeSigningUtil.isRecordTrusted('discovery_probes_snmp_field', specsGR.getUniqueValue(), 'ecc_queue');
            if (result) {
                var cmd = specsGR.getValue('command');
                var oid = specsGR.getValue('oid');
                var fld = specsGR.getValue('fields');
                var line = cmd;
                line += ' ';
                line += oid;
                if (cmd == 'table') {
                    line += ' ';
                    line += fld;
                }
                lines.push(line);
            }
        }
        param_map['oid_spec_list'] = lines.join('\n');
    },

    addStage: function(param_map) {
        var st = this.probeGR.getValue('stage');
        param_map['snmp_stage'] = st;
    },

    addTimingSpecs: function(param_map) {
        var reqTimeout = this.probeGR.getValue('request_timeout');
        var estTimeout = this.probeGR.getValue('est_sess_timeout');
        var reqInterval = this.probeGR.getValue('request_interval');
        param_map['timeout'] = reqTimeout;
        param_map['established_session_timeout'] = estTimeout;
        param_map['request_interval'] = reqInterval;
    },

    addDebug: function(param_map) {
        this.addBoolean('debug', 'debug', param_map);
    },

    addOIDAutoResolve: function(param_map) {
        this.addBoolean('resolve_oid', 'resolve_oid', param_map);
    },

    addBoolean: function(dbName, paramName, param_map) {
        var bool = (this.probeGR.getValue(dbName) == 1);
        param_map[paramName] = bool ? 'true' : 'false';
    },

    addSensorHandler: function(param_map) {
        var sh = this.probeGR.getValue('handler');
        param_map['handler'] = sh;
    },

    addJavascriptHandlers: function(param_map) {
        if (this.probeGR.getValue('stage') != 'classify/identify')
            return;

        var jh = this.probeGR.getValue('javascript_handlers');
        param_map['javascript_handlers'] = jh;
    },

    addVersionProtocols: function(param_map) {
        if (typeof g_status !== 'undefined') {
            var scheduleGr = new GlideRecord('discovery_schedule');
            if (scheduleGr.get(g_status.scheduleID)) {
                switch (String(scheduleGr.use_snmp_version)) {
                    case 'v1_v2c':
                        addV1V2c(true);
                        addV3(false);
                        break;
                    case 'v3':
                        addV1V2c(false);
                        addV3(true);
                        break;
                    case 'all':
                    default:
                        addV1V2c(true);
                        addV3(true);
                }
            }
        }

        function addV1V2c(tf) {
            param_map['use_snmp_v1_v2c'] = tf;
        }

        function addV3(tf) {
            param_map['use_snmp_v3'] = tf;
        }
    },

    type: 'ProbeHandlerSNMP'
}
