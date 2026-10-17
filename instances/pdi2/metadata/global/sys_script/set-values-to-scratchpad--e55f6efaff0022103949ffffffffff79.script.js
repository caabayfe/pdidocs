(function executeRule(current, previous /*null when async*/ ) {

    var provider = current.provider;
    g_scratchpad.provider = provider ? provider.name : "Event Provider";

})(current, previous);
