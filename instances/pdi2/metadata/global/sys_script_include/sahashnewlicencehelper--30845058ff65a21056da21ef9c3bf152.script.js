var SaHashNewLicenceHelper = Class.create();
SaHashNewLicenceHelper.prototype = {
    initialize: function() {
        this.MI_IS_NEW_LICENCE = "mi_is_new_license";
        this.evtMgmtCommons = new global.EvtMgmtCommons();
        this.foundDuplicate = false;
    },
    isNewLicence: function() {
        var gr = this.evtMgmtCommons.getHashGr(this.MI_IS_NEW_LICENCE);
        if (gr.getRowCount() > 1) {
            this.foundDuplicate = true;
        }
        if (gr.next()) {
            return gr.getValue('hash') == "true";
        } else {
            return undefined;
        }
    },
    setNewLicence: function(value) {
        if (value != undefined) {
            this.evtMgmtCommons.setHashGr(this.MI_IS_NEW_LICENCE, value);
        }
    },
    checkNewLicence: function() {
        var isNew = this.isNewLicence();
        if (this.foundDuplicate) {
            this.clearDuplicateHash();
        }
        if (!isNew) {
            //in case sn_itom_license scope is not install
            try {
                //Check if old licensing model is enabled
                var itomLicensingUtils = new sn_itom_licensing.ITOMLicensingUtilsStore();
                isNew = itomLicensingUtils.isNewLicenseModel();
                this.setNewLicence(isNew);
            } catch (e) {
                this.evtMgmtCommons.addDebugLogNoPrefix("SaHashNewLicenceHelper:" + e);
            }

        }
        return isNew;
    },
    clearDuplicateHash: function() {
        var gr = this.evtMgmtCommons.getHashGr(this.MI_IS_NEW_LICENCE);
        if (gr.getRowCount() > 1) {
            gr.next(); //do not delete first record
            while (gr.next()) {
                this.evtMgmtCommons.addDebugLogNoPrefix("SaHashNewLicenceHelper: deleting " + gr.getUniqueValue());
                gr.deleteRecord();
            }
        }
    },
    type: 'SaHashNewLicenceHelper'
};
