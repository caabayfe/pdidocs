(function executeRule(current, previous /*null when async*/) {

    // update the compliance status in the lookup table, if the setting exists or create a new one.
    new sn_vsc.VSCComplianceUtil().updateComplianceStatusLookUp(current.u_setting, current.u_compliance_state);
})(current, previous);
