(function(current) {

    if (!current || !current.getUniqueValue())
        return false;

    // If a change_risk_details record exists risk has been evaluated.
    // Do NOT change to GlideRecordSecure or call canRead.
    var changeRiskDetailsGr = new GlideRecord('change_risk_details');
    changeRiskDetailsGr.addQuery('change_request', current.getUniqueValue());
    changeRiskDetailsGr.query();
    return changeRiskDetailsGr.next();

})(current);
