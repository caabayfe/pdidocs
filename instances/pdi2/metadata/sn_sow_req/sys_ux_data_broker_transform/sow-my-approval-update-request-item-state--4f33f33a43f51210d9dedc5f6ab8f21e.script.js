function transform(input) {
    var action = input.action;
    var sysId = input.sysId;

    try {
        var updateState = new sn_sow_req.UpdateRequestItemState();
        var updateMessage = updateState.execute(sysId, action);
        return updateMessage;
    } catch (e) {
        return {
            message: sn_i18n.Message.getMessage("sn_sow_req", "Row level action failed"),
            status: "failed"
        };
    }
}
