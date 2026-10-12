(function executeRule(current, previous /*null when async*/ ) {
	var util = new AisConfigurationUtil();
    if (current.operation() == "update")
        util.createOrUpdateDefaultSpellcheckDictionary(previous.profile, previous.profile.label);
    util.createOrUpdateDefaultSpellcheckDictionary(current.profile, current.profile.label);
})(current, previous);
