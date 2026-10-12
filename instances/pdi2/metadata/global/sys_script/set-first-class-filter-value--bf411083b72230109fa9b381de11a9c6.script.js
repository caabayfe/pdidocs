(function executeRule(current, previous /*null when async*/ ) {
    var filter = new sn_ais.AisUtil().getTableLevelAttribute(current.source, 'filter', '');
    var current_filter = current.filter;
    if (current.filter != filter)
        current.filter = filter;
})(current, previous);
