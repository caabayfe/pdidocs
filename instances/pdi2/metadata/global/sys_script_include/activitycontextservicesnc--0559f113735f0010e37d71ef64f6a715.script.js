var ActivityContextServiceSNC = Class.create();
ActivityContextServiceSNC.prototype = {
    initialize: function(activitySubContext) {
			this.activityContextDao = new ActivityContextDao(activitySubContext);
    },

    /* 
     * This method returns Activities from multiple source tables based on the given context and activity type definitions
     * @parameter - contextId: sys_id of a record in the Activity Context table
     * @parameter - contextInstanceId: sys_id of a record in the context instance table, ex: sys_id of a contact
     * @parameter - facetIds: comma separated list of facet sys_ids
     * @parameter - recordId: sys_id of a record, applicable in case of dynamic facets
     */
    getActivities: function(reqObj) {
        if (!reqObj.contextId || !reqObj.contextInstanceId) {
            return {
                "status": 400,
                "message": gs.getMessage("Make sure a valid context and context_instance are passed")
            };
        }
        var activityUtils = this.activityContextDao.activityUtils;
        if (!activityUtils.isValidSysId(reqObj.contextId) || !activityUtils.isValidSysId(reqObj.contextInstanceId)) {
            return {
                "status": 400,
                "message": gs.getMessage("Make sure a valid context and context_instance are passed")
            };
        }
        if (reqObj.recordId && !activityUtils.isValidSysId(reqObj.recordId)) {
            return {
                "status": 400,
                "message": gs.getMessage("Invalid record_id")
            };
        }
        reqObj.pageStart = parseInt(reqObj.stFrom);
        reqObj.pageEnd = parseInt(reqObj.last);
        if (reqObj.pageStart >= 0 && reqObj.pageEnd >= 0 && reqObj.pageStart > reqObj.pageEnd) {
            return {
                "status": 400,
                "message": gs.getMessage("stFrom can not be greater than last")
            };
        }
        if ((reqObj.startDate && !reqObj.endDate) || (reqObj.endDate && !reqObj.startDate))
            return {
                "status": 400,
                "message": gs.getMessage("Please provide start_date and end_date")
            };
        if (reqObj.startDate && reqObj.endDate && reqObj.startDate > reqObj.endDate) {
            return {
                "status": 400,
                "message": gs.getMessage("start_date can not be ahead of end_date")
            };
        }
        /* metaContextGr: GlideRecord of Activity Context table
         * actualContextGr: GlideRecord of a table mentioned in Activity Context table, ex: GlideRecord of account table for the contextInstanceId
         */
        var metaContextGr = this.activityContextDao.activityUtils.getGlideRecord(ActivityConstants.TABLE_ACTIVITY_CONTEXT, {
            "sys_id": reqObj.contextId,
			"module.active": true
        });
        if (!metaContextGr || !metaContextGr.isValidRecord()) {
            return {
                "status": 400,
                "message": gs.getMessage("Provided context is not configured in the system")
            };
        }
        var actualContextGr = this.activityContextDao.activityUtils.getGlideRecord(metaContextGr.context_table, {
            "sys_id": reqObj.contextInstanceId
        }, null, true);
        if (!actualContextGr || !actualContextGr.isValidRecord() || !actualContextGr.canRead()) {
            return {
                "status": 400,
                "message": gs.getMessage("Make sure a valid context_instance is passed")
            };
        }
        try {
            reqObj.actualContextGr = actualContextGr;
            reqObj.module = metaContextGr.module + "";
            var results = this.activityContextDao.getActivities(reqObj);
            return {
                "status": 200,
                "data": results
            };
        } catch (err) {
            return {
                "status": "500",
                "message": err.message
            };
        }
    },

    getActivityContexts: function(request) {
        if (!request.activityModule)
            return {
                "status": 400,
                "message": gs.getMessage("Make sure a valid activity module is passed")
            };

        try {
            var contexts = this.activityContextDao.getActivityContexts(request);
            return {
                "status": 200,
                "data": contexts
            };
        } catch (exception) {
            return {
                "status": "500",
                "message": exception.message
            };
        }
    },

    type: 'ActivityContextServiceSNC'
};
