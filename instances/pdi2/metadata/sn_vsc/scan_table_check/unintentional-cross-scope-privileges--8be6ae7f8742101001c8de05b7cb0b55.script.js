(function(finding, current) {

    var threshold = 25; // number of cross scope 
    // get number of cross scope privileges
    var snGr = new GlideAggregate('sys_scope_privilege');
    snGr.addQuery('sys_scope', current.sys_id.toString());
    snGr.addAggregate('COUNT');
    snGr.query(); // get all
    if (snGr.next()) {
        // compare against threshold
        var count = snGr.getAggregate('COUNT');
        if (count > threshold) {
            // add finding

            finding.setCurrentSource(current);
            finding.increment();
        }
    }


})(finding, current);
