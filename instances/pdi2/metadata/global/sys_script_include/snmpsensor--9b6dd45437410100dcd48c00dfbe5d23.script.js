// Discovery
var SnmpSensor = Class.create();

// @var string SnmpSensor.CACHE_CATALOG_FIELDS Cache key for SNMP Probe field data
SnmpSensor.CACHE_CATALOG_FIELDS = 'com.snc.discovery.SnmpSensor-fields';

SnmpSensor.prototype = Object.extendsObject(DiscoverySensor, {
    init: function(prototype) {
        DiscoverySensor.prototype.init.call(this, prototype);
        this._oidFields = null; // snmp
        this.deviceCi = null;
        this.snmp = null;
    },

    process: function(result) {
        //TODO: This should be moved to DiscoverySensor once we're comfortable with the idea
        var ciGr = this.getCmdbRecord();
        if (ciGr !== null) {
            this.deviceCi = new Ci(ciGr);
        } else {
            this.deviceCi = new Ci();
        }

        this.snmp = new SNMPResponse(result);
        this.processSnmp(this.deviceCi, this.snmp); // pass the ci object as well, for visibility
        this.deviceCi.write();
        this.setDefaultSave(false);
    },

    processSnmp: function(deviceCi, snmp) {
        throw 'Define processSnmp() before calling it.';
    },

    /**
     * Retrieves the OID for the specified field name from the respective Probe for this Sensor.
     * Automatically trims the last object name off of Table SNMP field OIDs, for ease of use with the SNMPResponse class.
     * OIDs are cached after first call.
     *
     * Example usage:
     * // table example
     * var entries = snmp.getOID(this.getProbeOid('vlans'));
     * for (var entry in entries)
     *   ...
     *
     */
    getProbeOid: function(probeFieldName) {
        if (this._oidFields === null)
            this._initOidFields();
        if (typeof this._oidFields[probeFieldName] === 'undefined')
            throw 'Probe SNMP field `' + probeFieldName + '` not found in probe';

        return this._oidFields[probeFieldName];
    },

    /**
     * Retrieves all of the table entries for the given probe field name.
     * @param string probeFieldName
     * @param string entryOid
     */
    getProbeTable: function(probeFieldName, entryOid) {
        return this.snmp.getOIDTable(this.getProbeOid(probeFieldName), entryOid);
    },

    _initOidFields: function() {
        // query cache first
        var probeId = '' + this.getParameter('probe');
        var cache = GlideCacheManager.get(SnmpSensor.CACHE_CATALOG_FIELDS, probeId);
        if (cache !== null) {
            this._oidFields = cache;
            return;
        }

        // build map from db
        this._oidFields = {};
        var gr = new GlideRecord('discovery_probes_snmp_field');
        gr.addQuery('probe', probeId);
        gr.query();
        while (gr.next()) {
            var result = SncDiscoveryCodeSigningUtil.isRecordTrusted('discovery_probes_snmp_field', gr.getUniqueValue(), 'ecc_queue');
            if (result) {
                var name = '' + gr.name;
                var oid = '' + gr.oid;
                if (gs.nil(name))
                    continue;
                if (gr.command == 'table')
                    oid = oid.substring(0, oid.lastIndexOf('.'));
                this._oidFields[name] = oid;
            }
        }

        // cache the results, by probe name
        GlideCacheManager.put(SnmpSensor.CACHE_CATALOG_FIELDS, probeId, this._oidFields);
    },
});
