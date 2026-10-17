function transform(inputs) {
    var changeRemedialActionUtil = new sn_sow_inc.ChangeRemedialActionUtil();
    return changeRemedialActionUtil.createChange(inputs.remedialActionParams, inputs.remedialActionExecutionId);
}
