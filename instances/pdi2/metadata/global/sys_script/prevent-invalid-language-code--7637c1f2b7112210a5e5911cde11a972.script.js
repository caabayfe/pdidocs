
            (function executeRule(current, previous /*null when async*/) {
    var langId = current.preferred_language;

    if(!sn_i18n.LanguageValidator.validateId(langId)) {
        gs.warn("Attempt to insert/update an invalid value for sys_user.preferred_language: " + langId);
        current.setAbortAction(true);
    }
})(current, previous);
