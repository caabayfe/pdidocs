function transform(input) {
    if (gs.nil(input.summary) || gs.nil(input.field) || gs.nil(input.table) || gs.nil(input.sysId))
        return {
            message: "Please pass required parameters",
            status: false
        };
    var confUtils = new NotifyUXFConferenceUtil();
    return confUtils.postSummary(input.summary, input.field, input.table, input.sysId);
}
