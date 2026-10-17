function transform(inputs) {
    var changeRemedialActionUtil = new sn_sow_inc.ChangeRemedialActionUtil();
    return changeRemedialActionUtil.updateChangeWithAuthorization(inputs.sysId, inputs.keyValuePairs);
}
