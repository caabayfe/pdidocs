(function executeRule(current, previous /*null when async*/ ) {

    if (current.table == '') {
        current.table = current.to_do_configuration.table;
    }

})(current, previous);
