gs.include('EvtMgmtCommons');

var EvtMgmtManualImpactTrigger = Class.create();
EvtMgmtManualImpactTrigger.prototype = {
    type: 'EvtMgmtManualImpactTrigger',

    initialize: function() {
        this.evtMgmtCommons = new global.EvtMgmtCommons();
    },

    triggerImpact: function() {
        var im = new SNC.ImpactManager();
        var gr = new GlideRecord("cmdb_ci_service_auto");
        gr.addQuery("operational_status", "1");
        gr.query();

        while (gr.next()) {
            var sysId = gr.getValue('sys_id');
            im.triggerImpact(sysId);
            this.printDebug(sysId);
        }
    },

    printDebug: function(sysId) {
        var debugMsg = "EvtMgmtManualImpactTrigger script include: Trigger Impact Calculation for service: ";
        debugMsg += sysId;
        this.evtMgmtCommons.addDebugMessage(debugMsg);
    },
};
