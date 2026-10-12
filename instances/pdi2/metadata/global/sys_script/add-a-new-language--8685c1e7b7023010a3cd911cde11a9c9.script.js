(function executeRule(current, previous /*null when async*/) {
	var langId = current.id;

	if(!sn_i18n.LanguageValidator.validateId(langId)) {
		gs.addErrorMessage(sn_i18n.Message.getMessage("sn_i18n_core-invalid_id", "The language ID {id} is invalid. IDs need to comply with the BCP-47 standard and be supported by Java. E.g.: es-MX, fr-MA", {id: langId}));
		current.setAbortAction(true);
	}
	else if(current.id.changes() && sn_i18n.LanguageValidator.hasLanguagePlugin(langId)){
		gs.addErrorMessage(sn_i18n.Message.getMessage("sn_i18n_core-supported-lang", "The language with ID {id} is already supported. Please activate the corresponding language plugin.", {id: langId}));
		current.setAbortAction(true);
	}
})(current, previous);
