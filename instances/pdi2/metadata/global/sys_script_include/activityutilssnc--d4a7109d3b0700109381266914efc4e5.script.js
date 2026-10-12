var ActivityUtilsSNC = Class.create();
ActivityUtilsSNC.prototype = {
    initialize: function() {},

    getContextActivityTypes: function(contextId) {
        if (!contextId)
            return;

        var contextGR = new GlideRecord(ActivityConstants.TABLE_M2M_CONTEXT_SUBOBJECT);
        contextGR.addQuery("activity_context", contextId);
        contextGR.query();

        var subobjects = [];
        while (contextGR.next()) {
            if (!contextGR.canRead())
                continue;

            if (contextGR.subobject)
                subobjects.push(contextGR.subobject + '');
        }


        if (subobjects.length > 0) {
            var subObjectsGR = new GlideRecord(ActivityConstants.TABLE_M2M_SUBOBJECT_ACTIVITY_TYPE);
            subObjectsGR.addQuery("subobject", "IN", subobjects.join());
            subObjectsGR.query();

            var activityTypes = [];
            while (subObjectsGR.next()) {
                if (!subObjectsGR.canRead())
                    continue;

                if (subObjectsGR.activity_type)
                    activityTypes.push(subObjectsGR.activity_type + '');
            }

            return activityTypes;
        }

        return [];
    },

    getGlideRecord: function(tableName, fieldValuePairs, encodedQuery, disableWorkflow) {
        if (!tableName) return;
        var gr = new GlideRecord(tableName);
        for (var field in fieldValuePairs) {
            gr.addQuery(field, fieldValuePairs[field]);
        }
		if (encodedQuery)
			gr.addEncodedQuery(encodedQuery);
		if (disableWorkflow)
			gr.setWorkflow(false);
        gr.query();
        if (gr.next()) return gr;
        return null;
    },

    compare: function(created, sortOrder) {
        return function(a, b) {
            if (a[created] > b[created]) {
                return sortOrder=='Asc'?1:-1;
            } else if (a[created] < b[created]) {
                return sortOrder=='Asc'?-1:1;
            }
            return 0;
        };
    },

    //Filter the data from given object based on the key that matches with ids
    filterData: function(obj, key, ids) {
        if (!obj) return;
        var result = {};
        key = key.split(".");
        for (var item in obj) {
            var keyVal = obj[item];
            for (var i = 0, len = key.length; i < len; i++) {
                if (keyVal) keyVal = keyVal[key[i]];
                else break;
            }
            if (ids.indexOf(keyVal) != -1) {
                result[item] = obj[item];
            }
        }
        return result;
    },

    getActivityTypeMessage: function(message, actor, object, target) {
        return GlideSysMessage.formatEscaped(message, [actor, object, target]);
    },

    isValidSysId: function(val) {
        if (!val) return true;
        return /^[a-f0-9]{32}$/.test(Array.isArray(val) ? val[0] : val + '');
    },

    type: 'ActivityUtilsSNC'
};
