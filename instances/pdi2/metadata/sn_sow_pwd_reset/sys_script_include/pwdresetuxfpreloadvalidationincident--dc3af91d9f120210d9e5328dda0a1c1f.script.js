var PwdResetUXFPreLoadValidationIncident = Class.create();
PwdResetUXFPreLoadValidationIncident.prototype = {
    initialize: function() {},

    retrievePwdResetOwner: function(table, sysID) {
        var ownerID = '';
        if (table === 'incident') {
            var incidentGR = new GlideRecord(table);
            if (incidentGR.get(sysID)) {
                ownerID = incidentGR.getValue("assigned_to");
            }
        }
        return ownerID;
    },

    type: 'PwdResetUXFPreLoadValidationIncident'
};
