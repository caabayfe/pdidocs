(function executeRule(current, previous /*null when async*/ ) {
    // we just closed this requested item. Have to cancel its approvals
    var reqItem = new SNC.RequestItem(current);
    if (reqItem)
        reqItem.cancelRelatedRecords();
})(current, previous);
