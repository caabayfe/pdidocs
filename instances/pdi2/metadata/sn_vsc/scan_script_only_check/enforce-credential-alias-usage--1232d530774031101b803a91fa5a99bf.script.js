(function(finding) {

    // Query to see if any MID Servers are configured
    var gr1 = new GlideRecord('ecc_agent');
    gr1.query();

    // Query for MID Server Property alias_filtering_behavior
    var gr2 = new GlideRecord('ecc_agent_property');
    var propQuery = 'name=alias_filtering_behavior^value=strict';
    gr2.addEncodedQuery(propQuery);
    gr2.query();

    // Check to make sure MID Server functionality is utilized before returning a finding
    // If the property table record does not exit, then default is loose, which is a finding
    if (gr1.next()) {
        if (!gr2.next()) {
            var gr = new GlideRecord('ecc_agent_property');
            gr.addEncodedQuery(propQuery);
            gr.query();
            gr.next();
            finding.setCurrentSource(gr);
            finding.increment();
        }
    }
})(finding);
