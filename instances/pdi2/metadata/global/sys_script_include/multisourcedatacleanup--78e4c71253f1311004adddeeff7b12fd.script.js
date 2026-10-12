var MultisourceDataCleanup = Class.create();
MultisourceDataCleanup.prototype = {
    initialize: function() {},

    getClassesForCleanup: function() {
        var classForCleanupMap = {};
        this.getDenyClassesForCleanup(classForCleanupMap);
        this.getNonCmdbClassesForCleanup(classForCleanupMap);

        return Object.keys(classForCleanupMap);
    },

    getDenyClassesForCleanup: function(classForCleanupMap) {
        var gr = new GlideRecord('cmdb_multisource_deny_class');
        gr.addActiveQuery();
        gr.query();
        while (gr.next()) {
            var parentClassName = gr.getValue('class');
            var ext = GlideDBObjectManager.get().getAllExtensions(parentClassName);
            for (var x = 0; x < ext.size(); ++x) {
                var className = ext.get(x) + "";
                if (!classForCleanupMap[className])
                    classForCleanupMap[className] = true;
            }
        }
    },

    /**
     * Populates the classForCleanupMap with non-CMDB classes based on the logic:
     *   1. Skips processing entirely if the system property glide.identification_engine.multisource_non_cmdb_ci_enabled is set to true.
     *   2. If the scheduled job "Multisource Dashboard Analytics Population" is active and 
     *      and table sn_cmdb_ws_ms_class_ci_count has class data, use that.
     *   3. If no data is returned from that table or the job is inactive, fallback to querying the cmdb_multisource_data table.
     */
    getNonCmdbClassesForCleanup: function(classForCleanupMap) {
        var g = new GlideRecord('sys_properties');
        g.get('name', 'glide.identification_engine.multisource_non_cmdb_ci_enabled');
        if (g.isValidRecord() && g.getValue('value').toLowerCase() == 'true')
            return;

        if (this._populateFromMsClassCiCountTable(classForCleanupMap)) {
            return;
        }

        this._populateFromMultisourceData(classForCleanupMap);
    },

    _populateFromMsClassCiCountTable: function(classForCleanupMap) {
        var jobGr = new GlideRecord('sysauto_script');
		//if the job does not exist or is inactive, return
        if (!(jobGr.get('c60b429c0f28411024b63ab1df767e00') && jobGr.getValue('active') == true))
            return false;

        var gr = new GlideRecord('sn_cmdb_ws_ms_class_ci_count');
        gr.addQuery('state', 2);
        gr.query();

        var hasClassData = false;
        while (gr.next()) {
            hasClassData = true;
            var baseClass = GlideDBObjectManager.getAbsoluteBase(gr.getValue('class'));
            if (baseClass != 'cmdb_ci')
                classForCleanupMap[baseClass] = true;
        }
        return hasClassData;
    },
	
    _populateFromMultisourceData: function(classForCleanupMap) {
        var gr = new GlideAggregate('cmdb_multisource_data');
        gr.groupBy('class');
        gr.query();
        while (gr.next()) {
            var baseClass = GlideDBObjectManager.getAbsoluteBase(gr.getValue('class'));
            if (baseClass != 'cmdb_ci')
                classForCleanupMap[baseClass] = true;
        }
    },

    type: 'MultisourceDataCleanup'
};
