var CustomerActionUtils = Class.create();
CustomerActionUtils.prototype = {
    constants: new sn_vsc.SecurityCenterConstants(),
    initialize: function() {},

    shouldHideAlert: function(customerAction) {
        var hideAlert = true;
        var alertMsg = '';
        var grPD = new GlideRecord(this.constants.TABLE_PD_CONTEXT);
        grPD.addQuery('input_record', customerAction);
        grPD.orderByDesc('sys_created_on');
        grPD.query();
        if (grPD.getRowCount() <= 1) {
            return {
                hideAlertResponse: hideAlert,
                alertMessage: alertMsg
            };
        }

        grPD.next(); //get latest playbook snapshot
        if (grPD.getValue('state') === this.constants.playbookContextState.IN_PROGRESS) //check if current snapshot is still in progress
            hideAlert = false;

        //get previous playbook snapshot record
        grPD.next();
        if (grPD.getValue('state') === this.constants.playbookContextState.COMPLETE) {
            alertMsg = this.constants.PB_COMPLETED_ALERT_MESSAGE;
        } else if (grPD.getValue('state') === this.constants.playbookContextState.CANCELLED) {
            alertMsg = this.constants.PB_NOT_COMPLETED_ALERT_MESSAGE;
        }
        return {
            hideAlertResponse: hideAlert,
            alertMessage: alertMsg
        };
    },
    type: 'CustomerActionUtils'
};
