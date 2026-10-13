var EvtMgmtExcludedPatterns = Class.create();
EvtMgmtExcludedPatterns.prototype = {
    initialize: function() {},

    exclude: function(patternGr) {
        var sysId = patternGr.getUniqueValue();
        gs.log("EvtMgmtExcludedPatterns: Excluding pattern with sys_id=" + sysId);

        // copy the pattern content to sa_agg_excluded_pattern table
        // query old table
        var gr = new GlideRecord("sa_agg_pattern_element");
        gr.addQuery("pattern_id", sysId);
        gr.query();

        // prepare new table GR
        while (gr.next()) {
            var newGr = new GlideRecord("sa_agg_excluded_pattern");
            newGr.initialize();
            newGr.setValue("pattern_id", sysId);
            newGr.setValue("cmdb_ci", gr.getValue("cmdb_ci"));
            newGr.setValue("ci_class", gr.getValue("ci_class"));
            newGr.setValue("feature_identifier", gr.getValue("feature_identifier"));
            newGr.setValue("sys_domain", gr.getValue("sys_domain"));
            newGr.insert();
        }

        // now, delete the pattern from active patterns (with cascade delete in other pattern tables)
        patternGr.deleteRecord();
    },

    type: 'EvtMgmtExcludedPatterns'
};
