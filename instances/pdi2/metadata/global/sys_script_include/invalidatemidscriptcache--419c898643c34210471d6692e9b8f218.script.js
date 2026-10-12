var InvalidateMIDScriptCache = Class.create();
var eccQueueParam = {
    'source': 'invalidate_cache',
    'topic': 'SystemCommand',
    'queue': 'output',
    'state': 'ready'
};

InvalidateMIDScriptCache.prototype = {
    initialize: function() {},

    invalidateMidScriptIncludeCache: function(docId) {

        // get name of script to invalidate in cache
        var gr = new GlideRecord('ecc_agent_script_include');
        gr.addQuery('sys_id', docId);
        gr.query(docId);

        if (gr.next()) {

            var midScriptName = gr.getValue('name');

            var payloadParam = {
                'type': 'script_include',
                'name': midScriptName
            };

            // broadcast to all the mid servers
            new SNC.MidEccSender().broadcastToAllMidServers('Interactive', eccQueueParam, payloadParam);
        }
    },

    invalidateEntireMidScriptIncludeCache: function() {
        var payloadParam = {
            'type': 'script_include',
        };

        new SNC.MidEccSender().broadcastToAllMidServers('Interactive', eccQueueParam, payloadParam);
    },

    type: 'InvalidateMIDScriptCache'
};
