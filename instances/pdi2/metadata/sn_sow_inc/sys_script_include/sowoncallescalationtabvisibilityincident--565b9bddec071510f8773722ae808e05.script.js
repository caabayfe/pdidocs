
            var SOWOnCallEscalationTabVisibilityIncident = Class.create();
SOWOnCallEscalationTabVisibilityIncident.prototype = {
    initialize: function() {},

    showEscalationTab: function(table, sysId) {
        var isValidRecord = false;

        if (table && sysId && table === 'incident') {
            var gr = new GlideRecord(table);
            if (gr.get(sysId) && gr.isValidRecord())
                isValidRecord = true;
        }

        if (!isValidRecord)
            return false;
        
        return isValidRecord;
    },

    type: 'SOWOnCallEscalationTabVisibilityIncident'
};
