new DiscoverySensor({
    process: function() {
        var snmpClassify = new SncClassify(g_probe);
        snmpClassify.process();
    },
        
    type: 'DiscoverySensor'
});
