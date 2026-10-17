// Discovery
/**
 * Processes CIM Probe results.
 * @author roy.laurie
 */
var CimProbeResult = Class.create();

CimProbeResult.prototype = {
    initialize: function(probeResult) {
        var gr;

        if (gs.nil(probeResult) || gs.nil(probeResult.cimqueryset))
            return;

        var cimQueries = g_array_util.ensureArray(probeResult.cimqueryset.cimquery);
        for (var iq = 0, nq = cimQueries.length; iq < nq; ++iq) {

            // Find the name of the query using the query string
            gr = new GlideRecord('discovery_probes_cim_query');
            gr.addQuery('query', '' + cimQueries[iq].probeQuery);
            gr.query();
            if (gr.next()) {
                var result = SncDiscoveryCodeSigningUtil.isRecordTrusted('discovery_probes_cim_query', gr.getUniqueValue(), 'ecc_queue');
                if (result)
                    cimQueries[iq].name = gr.name;
            }

            if (gs.nil(cimQueries[iq].result)) {
                cimQueries[iq].result = {
                    instance: [],
                    schema: []
                };
            } else {
                cimQueries[iq].result.instance = g_array_util.ensureArray(cimQueries[iq].result.instance);
                cimQueries[iq].result.schema = g_array_util.ensureArray(cimQueries[iq].result.schema);

                // ensure arrays within each cim object
                for (var o = 0; o < cimQueries[iq].result.instance.length; ++o) {
                    cimQueries[iq].result.instance[o]._associations = g_array_util.ensureArray(cimQueries[iq].result.instance[o]._association);
                    delete cimQueries[iq].result.instance[o]._association;
                }
            }
        }

        this._queries = cimQueries;
    },

    getQueries: function() {
        return this._queries;
    },

    /**
     * @param { name: query,.. } namedQueries
     */
    getNamedInstances: function(namedQueries) {
        var instances = {};
        for (var name in namedQueries) {
            var query = this._findQuery(namedQueries[name], this._queries);
            if (!query)
                throw new IllegalArgumentException('CIM query `' + name + '` not found in CIM Probe results.');

            instances[name] = query.result.instance;
        }

        return instances;
    },

    /**
     * @param string query
     * @param XMLObj(//cimqueryset/cimquery[]) classificationCimQuery
     * @return null|XMLObj(//cimqueryset/cimquery)
     */
    _findQuery: function(queryStr, queries) {
        for (var i = 0, n = queries.length; i < n; ++i) {
            if (queries[i].probeQuery == queryStr)
                return queries[i];
        }

        return null;
    },

    type: 'CimProbeResult'
};
