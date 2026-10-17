gs.include('EvtMgmtCommons');

var EvtMgmtAlertGroupsImpactCalculatorHashSync = Class.create();

EvtMgmtAlertGroupsImpactCalculatorHashSync.prototype = {
    initialize: function() {
        this.evtMgmtCommons = new EvtMgmtCommons();
    },

    checkAndSync: function() {
        var gap = gs.getProperty("evt_mgmt.impact.calc_job_gap", 200);
        var groupsHashGr = this.evtMgmtCommons.getHashGr('last_impact_batch_calc_job-2');
        var groupsHash = 0;
        if (groupsHashGr.next()) {
            groupsHash = groupsHashGr.getValue('hash');
        }
        // In some cases the last_impact_batch_calc_job-2 hash goes out of sync and shows a number in scientific notation (e.g. 1.2440411E7)
        // If this happens we will change the hash back to the regular format. 
        var refactorGroupHash = groupsHash.includes('E');
        if (refactorGroupHash) {
            gs.warn(this.type + ': last_impact_batch_calc_job-2 is shown in scientific notation with value: ' + groupsHash + '. The hash value will be changed to regular form.');
        }

        var impactJobHashGr = this.evtMgmtCommons.getHashGr('last_impact_batch_calc_job0');
        var impactCalcJobHash = 0;
        if (impactJobHashGr.next()) {
            impactCalcJobHash = impactJobHashGr.getValue('hash');
        }

        if (refactorGroupHash || ((impactCalcJobHash - groupsHash) > gap)) {
            var hashVal = impactCalcJobHash - 1;
            //removes the scientific notation if exists
            hashVal = GlideStringUtil.parseLong(hashVal);
            if (hashVal == 0) { // fallback if parseLong can't parse the hash value
                hashVal = impactCalcJobHash;
            }

            this.evtMgmtCommons.setHashGr('last_impact_batch_calc_job-2', hashVal);
        }

    },

    type: 'EvtMgmtAlertGroupsImpactCalculatorHashSync'
};
