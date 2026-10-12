(function executeRule(current, previous /*null when async*/) {

	var groupSeparator = current.value.charAt(0);
	var decimalSeparator = current.value.charAt(1);

	if(groupSeparator === decimalSeparator){
		gs.addErrorMessage(sn_i18n.Message.getMessage("com.glide.i18n.core", "Group and decimal separators have to be different{?Separators refer to the characters used in numbers as thousand or decimal separators}"));
		current.setAbortAction(true);
	}
	if(isNumeric(groupSeparator) || isNumeric(decimalSeparator)){
		gs.addErrorMessage(sn_i18n.Message.getMessage("com.glide.i18n.core", "Group and decimal separators cannot be numbers{?Separators refer to the characters used in numbers as thousand or decimal separators}"));
		current.setAbortAction(true);
	}
	if(isExcludedCharacter(groupSeparator) || isExcludedCharacter(decimalSeparator)){
		gs.addErrorMessage(sn_i18n.Message.getMessage("com.glide.i18n.core", "Separators cannot be one of these characters + - < >{?Separators refer to the characters used in numbers as thousand or decimal separators}"));
		current.setAbortAction(true);
	}
})(current, previous);

function isNumeric(str) {
  if (typeof str != "string") return false // we only process strings!  
  return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
         !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

function isExcludedCharacter(separator) {
	return '+' === separator || '-' === separator || '<' === separator || '>' === separator;
}
