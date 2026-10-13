var OnCallShiftAjax = Class.create();
OnCallShiftAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {


    initialize: function(request, responseXML, gc) {
        AbstractAjaxProcessor.prototype.initialize.call(this, request, responseXML, gc);
    },

    /*
     * Check if login user is shift manager or admin and upgrade shift to new engine.
     */
    upgradeShiftToNewScheduleEngine: function() {
        var ocr = new OnCallRotation();
        var rotaId = this.getParameter('sysparm_sys_id');
        var rotaGr = new GlideRecord('cmn_rota');
        if (rotaGr.get(rotaId)) {
            if (ocr.isShiftOnOldEngine(rotaGr) && new OnCallSecurityNG().rotaMgrAccess(rotaGr.group + '')) {
                ocr.upgradeShiftToNewScheduleEngine(rotaGr);
            }
        }
    },

    type: "OnCallShiftAjax"
});
