(function executeRule(current, previous /*null when async*/ ) {
    if ('dot_walked_field' == current.boost_context_field) {
        var fields = current.user_dotwalked_field.split(",");
        if (fields.length > 1) {
            current.setAbortAction(true);
            gs.addErrorMessage(gs.getMessage("Only one dot-walked field per action is supported"));
        }
        if (!sn_search.SearchContextUtils.isSysUserDotwalkFieldValid(current.user_dotwalked_field)) {
            current.setAbortAction(true);
            gs.addErrorMessage(gs.getMessage("Invalid sys_user dot-walk field"));
        }
    }

})(current, previous);
