var UnifiedMapIntegrationUtil = Class.create();
UnifiedMapIntegrationUtil.prototype = {
    initialize: function() {
    },

    buildUnifiedMapUrl: function(params) {
        var rootNode = params.rootNode;
        var selectedNodeSysid = params.selectedNodeSysid;
        var selectedNodeClass = params.selectedNodeClass;
        var selectedConnectionId = params.selectedConnectionId;
        var levels = params.levels;

        var url = 'now/cmdb/home/sub/unifiedmap/params/root-node/' + rootNode;
        url += '/selected-node-sysid/' + selectedNodeSysid;
        url += '/selected-node-class/' + selectedNodeClass;
        url += '/levels/' + levels;
        return url;
    },

    type: 'UnifiedMapIntegrationUtil'
};
