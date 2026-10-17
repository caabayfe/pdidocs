function transform(input) {
    var resultData = input.data || {};
    var util = new VSCComplianceUtil();
    util.activateSpecialConfigs(resultData);
    util.runComplianceCheck();
}
