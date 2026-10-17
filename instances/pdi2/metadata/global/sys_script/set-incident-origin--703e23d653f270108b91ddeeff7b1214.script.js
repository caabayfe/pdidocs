(function executeRule(current, previous /*null when async*/ ) {
    current.origin_table = 'change_request';
    current.origin_id = current.caused_by;
})(current, previous);
