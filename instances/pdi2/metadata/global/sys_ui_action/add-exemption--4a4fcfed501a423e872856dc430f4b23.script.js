(function() {
    var created = new GlideGuardedScript().addExemption(current);
    var redirect = action.isFromList() ? current.getTableName() + '_list.do' : current;
    if (!created) {
        gs.addInfoMessage(sn_i18n.Message.getMessage('sys_gs_exemption', 'An exemption already exists for this script'));
        action.setRedirectURL(redirect);
        return;
    }
    gs.addInfoMessage(sn_i18n.Message.getMessage('sys_gs_exemption', 'Exemption created'));
    action.setRedirectURL(redirect);
})();
