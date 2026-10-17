(function executeRule(current, previous /*null when async*/ ) {
    var cafLiveAgentUtils = new CAFLiveAgentUtils();
    cafLiveAgentUtils.createCAFPropsOnProviderApplication(current.sys_id);
})(current, previous);
