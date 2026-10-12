function transform(input) {
    try {
        var result = NAARoleUtil.syncRoles(input.skillConfigId, input.aclData.filter(item => item.decisionType === "allow"), input.missingRoles);
        return result;

    } catch (error) {
        gs.error("NowAssistAdmin: Error occurred in Sync roles data broker :" + error.toString());
    }
}
