(function executeRule(current, previous /*null when async*/ ) {
    // dues date will be the time it got assigned + delivery_time
    var daysStr = current.cat_item.delivery_time.getDisplayValue();
    var days = daysStr.split(' ')[0];
    gs.print("days = " + days);
    current.due_date.setValue(gs.daysAgo(-1 * days));

})(current, previous);
