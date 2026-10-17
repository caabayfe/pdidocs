(function(data, options, input) {
    var configs = sn_cs.VASystemObject.getAINativeDeploymentChannelConfigs(true, true);
    data.isNextWaveEnabled = Array.isArray(configs) && configs.length > 0;
})(data, options, input);
