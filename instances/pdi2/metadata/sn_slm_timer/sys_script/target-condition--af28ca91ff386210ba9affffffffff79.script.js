(function executeRule(current, previous /*null when async*/ ) {
    current.condition = new SLATimer().getTargetEncQuery(current) || '';
})(current, previous);
