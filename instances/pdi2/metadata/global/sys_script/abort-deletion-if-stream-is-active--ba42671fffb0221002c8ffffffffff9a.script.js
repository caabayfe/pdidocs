(function executeRule(current, previous /*null when async*/) {
    var util = new StreamConnectUtils();
    util.deleteInactiveStream(current);
})(current, previous);
