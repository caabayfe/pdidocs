(function executeRule(current, previous /*null when async*/ ) {

    var queue = current.queue_ref.getRefRecord();
    if (!queue.isValidRecord()) return;

    var provider = queue.provider.getRefRecord();
    g_scratchpad.provider = provider.isValidRecord() ? provider.name : "Event Provider";

})(current, previous);
