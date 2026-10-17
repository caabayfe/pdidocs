(function executeRule(current, previous /*null when async*/) {
    if (current.getValue('status') !== 'pre_flight') {
        if (current.getValue('status')) {
            gs.warn('IpkiMigration before-insert: caller set status=' + current.getValue('status') +
                    '; forcing pre_flight. mid_server=' + current.getValue('mid_server'));
        }
        current.setValue('status', 'pre_flight');
    }
})(current, previous);
