var SDSelfServiceAnalyticsUtils = Class.create();
SDSelfServiceAnalyticsUtils.prototype = {
    initialize: function() {},

    getVACategory: function(scopeIDs) {
        var topicCategory = [];
        var grCategory = new GlideRecord('sys_cb_topic_category');
        grCategory.addQuery('sys_scope', 'IN', scopeIDs);
        grCategory.query();
        while (grCategory.next())
            topicCategory.push(grCategory.getUniqueValue());
        return topicCategory.join(',');
    },

    getVaCountByCategory: function(topicCategory) {
        var gaTopic = new GlideAggregate('sys_cb_topic');
        gaTopic.addAggregate('COUNT');
        gaTopic.addQuery('category', 'IN', topicCategory);
        gaTopic.query();
        if (gaTopic.next())
            return parseInt(gaTopic.getAggregate('COUNT'));
        return 0;
    },

    getVACountByDeflection: function(deflectionPatternIDs) {
        var queryList = [];
        deflectionPatternIDs.split(',').forEach(function(k) {
            queryList.push('graphLIKE' + k);
        });
        var gaCBTopic = new GlideAggregate('sys_cb_topic');
        gaCBTopic.addAggregate('COUNT');
        gaCBTopic.addEncodedQuery(queryList.join('^OR'), true);
        gaCBTopic.query();
        if (gaCBTopic.next()) return parseInt(gaCBTopic.getAggregate('COUNT'));
        return 0;
    },

    getDeflectionPatternIDs: function(encQuery) {
        var ids = [];
        var grDefPattern = new GlideRecord('ssa_deflection_pattern');
        grDefPattern.addEncodedQuery(encQuery);
        grDefPattern.query();
        while (grDefPattern.next())
            ids.push(grDefPattern.getUniqueValue());
        return ids.join(',');
    },

    getSourceEncQuery: function(encQuery, sourceTable, sourceRefColumn) {
        var defPatternQuery = this.parseQueryFromEncodedQuery('ssa_deflection_metric', encQuery, 'deflection_pattern');
        var activityMetaData = this.getActivityMetaData(defPatternQuery);
        var encQueryList = [];
        for (var i in activityMetaData) {
            var queryList = [];
            Object.keys(activityMetaData[i]).forEach(function(key) {
                if (key == 'activity_type' || key == 'activity_context')
                    queryList.push(key + 'IN' + activityMetaData[i][key]);
            });
            if (sourceTable) queryList.push('source_table=' + sourceTable);
            encQueryList.push(queryList.join('^'));
        }
        var activityContextEncQuery = encQueryList.join('^NQ');
        return this.getSimilarActivityContextType(activityContextEncQuery, sourceRefColumn);
    },


    getSimilarActivityContextType: function(encQuery, refColumn) {
        var encQueryList = [];
        var grActContextType = new GlideRecord('sn_actsub_source_context_mapping');
        if (!encQuery || !grActContextType.isValidEncodedQuery(encQuery))
            return '';
        grActContextType.addEncodedQuery(encQuery);
        grActContextType.query();
        while (grActContextType.next()) {
            if (!gs.nil(grActContextType.getValue('mapping_criteria')))
                encQueryList.push(this.parseQueryFromEncodedQuery(grActContextType.getValue('source_table'), grActContextType.getValue('mapping_criteria'), refColumn));
        }
        return encQueryList.join('^NQ');
    },

    //Get Self Service Analytics configuration from the deflection configuration
    getActivityMetaData: function(encQuery) {
        var activities = [];
        var grDefPattern = new GlideRecord('ssa_deflection_pattern');
        if (!encQuery || !grDefPattern.isValidEncodedQuery(encQuery))
            return activities;
        grDefPattern.addEncodedQuery(encQuery);
        grDefPattern.query();
        while (grDefPattern.next()) {
            var activityType = [],
                primaryActivity = [],
                activity = [];
            var activityContext = grDefPattern.deflection_configuration.activity_context.sys_id.toString();
            var activityPattern = grDefPattern.activity_pattern;
            if (activityPattern.primary_activity)
                primaryActivity.push(activityPattern.primary_activity.sys_id.toString());

            var grPatternElement = new GlideRecord('ssa_pattern_m2m_element');
            grPatternElement.addQuery('pattern', activityPattern.sys_id);
            grPatternElement.query();
            while (grPatternElement.next())
                activity.push(grPatternElement.element.activity_type);

            activities.push({
                "activity_context": activityContext,
                "primary_activity": primaryActivity.join(','),
                "activity": activity.join(','),
                "activity_type": primaryActivity.concat(activity).join(',')
            });
        }
        return activities;
    },
    // Used for parsing the query which is present for the reference column
    parseQueryFromEncodedQuery: function(table, encQuery, refColumn) {
        var gr = new GlideRecord(table);
        if (!gr.isValidEncodedQuery(encQuery) || !gr.isValidField(refColumn)) return '';
        // Split the query by '^NQ'
        var orGroups = encQuery.split('^NQ');
        var modifiedOrGroups = [];
        orGroups.forEach(function(orGroup) {
            // Split the query by both '^' and '^OR' operators
            var fields = orGroup.split(/(\^OR|\^)/);
            var modifiedFields = [];
            for (var i = 0; i < fields.length; i++) {
                var field = fields[i].trim();
                if (field.includes(refColumn)) {
                    // Check if the field contains the dot operator. If it does, remove the reference table prefix. If it doesn't, replace reference table with 'sys_id'
                    field = field.includes(".") ? field.replace(refColumn + ".", "") : field.replace(refColumn, "sys_id");
                    if (i > 0 && modifiedFields.length > 0 && (fields[i - 1].trim() == '^' || fields[i - 1].trim() == '^OR')) {
                        modifiedFields.push(fields[i - 1].trim() + field);
                    } else {
                        modifiedFields.push(field);
                    }
                }
            }
            modifiedOrGroups.push(modifiedFields.join(''));
        });
        return modifiedOrGroups.join('^NQ');
    },
    type: 'SDSelfServiceAnalyticsUtils'
};
