var PwdResetUXFPreLoadValidationInteraction = Class.create();
PwdResetUXFPreLoadValidationInteraction.prototype = {
    initialize: function() {},

    retrievePwdResetOwner: function(table, sysID) {
        var ownerID = '';
        if (table === 'interaction') {
            var interactionGR = new GlideRecord(table);
            if (interactionGR.get(sysID)) {
                ownerID = interactionGR.getValue("assigned_to");
            }
        }
        return ownerID;
    },

    type: 'PwdResetUXFPreLoadValidationInteraction'
};
