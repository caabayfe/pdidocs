var SowIncidentImpactUtilsSNC = Class.create();
SowIncidentImpactUtilsSNC.prototype = {
    TABLES: {
        SYS_USER: "sys_user",
        TASK_SERVICE: "task_service_offering"
    },

    FIELDS: {
        SYS_ID: "sys_id",
        LOCATION: "location",
        TASK: 'task',
        SERVICE_OFFERING: 'service_offering'
    },

    QUERY_OPERATORS: {
        IN: "IN"
    },

    initialize: function() {},

    getGlideRecord: function(table, sysIdOrGr) {
        if (typeof sysIdOrGr == "string") {
            var gr = new GlideRecord(table);
            gr.get(sysIdOrGr);
            return gr;
        }
        return sysIdOrGr;
    },

    isValidGr: function(gr) {
        if (gr && gr instanceof GlideRecord && gr.isValidRecord()) {
            return true;
        }
    },

    getIncidentServiceOfferings: function(incSysId) {
        var serviceOfferings = [];
        var gr = new GlideRecord(this.TABLES.TASK_SERVICE);
        gr.addQuery(this.FIELDS.TASK, incSysId);
        gr.query();
        while (gr.next()) {
            var serviceOffering = gr.getValue(this.FIELDS.SERVICE_OFFERING);
            if (!gs.nil(serviceOffering))
                serviceOfferings.push(serviceOffering);
        }
        return this.removeDuplicates(serviceOfferings);
    },

    getUsersLocations: function(usersSysIds) {
        var usersLocations = [];
        var gr = new GlideRecord(this.TABLES.SYS_USER);
        gr.addQuery(this.FIELDS.SYS_ID, this.QUERY_OPERATORS.IN, usersSysIds.join());
        gr.query();
        while (gr.next()) {
            var userLocation = gr.getValue(this.FIELDS.LOCATION);
            if (!gs.nil(userLocation))
                usersLocations.push(userLocation);
        }
        return this.removeDuplicates(usersLocations);
    },

    mergeArrays: function(arrayOne, arrayTwo) {
        for (var i = 0; i < arrayTwo.length; i++) {
            if (arrayOne.indexOf(arrayTwo[i]) == -1) {
                arrayOne.push(arrayTwo[i]);
            }
        }
    },

    removeDuplicates: function(array) {
        array = array.filter(function(item, index, inputArray) {
            return inputArray.indexOf(item) == index;
        });
        return array;
    },

    type: 'SowIncidentImpactUtilsSNC'
};
