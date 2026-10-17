(function executeRule(current, previous /*null when async*/) {
    try {
        if (JSUtil.nil(ListProperties) || ListProperties.isRelatedList() || !gs.hasRole('maint'))
            return;

        gs.addInfoMessage(sn_i18n.Message.getMessage("global", "Please set the next_dish_ping field in the sys_service table further in the future if you want to do manual testing with endpoints."));
    } catch (e) {}
})(current, previous);
