// Discovery
/**
 * Maintains CIM Probe meta.
 * @author roy.laurie
 */
var CimProbe = Class.create();

CimProbe.TABLE_PROBE_QUERY = 'discovery_probes_cim_query';
CimProbe.FIELD_PROBE = 'probe';

CimProbe.prototype = {
    initialize: function(probeId) {
        this.probeId = probeId;
    },

    /**
     * @return string[]
     */
    getStatements: function() {
        var statements = [];
        var record = this.getStatementRecords();
        while (record.next()) {
            var result = SncDiscoveryCodeSigningUtil.isRecordTrusted(CimProbe.TABLE_PROBE_QUERY, record.getUniqueValue(), 'ecc_queue');
            if (result)
                statements.push('' + record.query);
        }

        return statements;
    },

    /**
     * @return string[]
     */
    getStatementNames: function() {
        var names = [];
        var record = this.getStatementRecords();
        while (record.next()) {
            var result = SncDiscoveryCodeSigningUtil.isRecordTrusted(CimProbe.TABLE_PROBE_QUERY, record.getUniqueValue(), 'ecc_queue');
            if (result)
                names.push('' + record.name);
        }

        return names;
    },

    /**
     * @return { string name:string statement }
     */
    getNamedStatements: function() {
        var statements = {};
        var record = this.getStatementRecords();
        while (record.next()) {
            var result = SncDiscoveryCodeSigningUtil.isRecordTrusted(CimProbe.TABLE_PROBE_QUERY, record.getUniqueValue(), 'ecc_queue');
            if (result)
                statements['' + record.name] = '' + record.query;
        }

        return statements;
    },

    /**
     * @return GlideRecord(discovery_probes_cim_query)
     */
    getStatementRecords: function() {
        var records = new GlideRecord(CimProbe.TABLE_PROBE_QUERY);
        records.addQuery(CimProbe.FIELD_PROBE, this.probeId);
        records.addActiveQuery();
        records.query();
        return records;
    },

    type: 'CimProbe'
};
