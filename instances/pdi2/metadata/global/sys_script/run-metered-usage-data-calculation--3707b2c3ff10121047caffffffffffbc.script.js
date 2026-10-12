(function executeRule(current, previous /*null when async*/ ) {
    //BR Condition -> Run only when version is mined successfully and is not sample mining
    try {
        new sn_po.ProminLicenseCheckUtils().processUsageDataForMeteredLicensing(current);
    } catch (e) {
        gs.error("ProminMeterCalculationBR: something went wrong while processing usage data\n" + e);
    }

})(current, previous);
