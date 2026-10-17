var SOWServiceDeskAgentShift = Class.create();
SOWServiceDeskAgentShift.prototype = Object.extendsObject(SOWServiceDeskAgentShiftSNC, {
    initialize: function() {
        SOWServiceDeskAgentShiftSNC.prototype.initialize.call(this);
    },

    type: 'SOWServiceDeskAgentShift'
});
