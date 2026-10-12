(function executeRule(current, previous /*null when async*/ ) {
    var TEMPLATE_FIELD = 'template';
    var CARD_LABEL_PROP = 'cardLabel';
    var BUTTON_LABEL_PROP = 'buttonLabel';
	var EVAM_CARD_NAME = 'now-card-evam-record';
	var template = JSON.parse(current.getValue(TEMPLATE_FIELD));
	if (template['component'] !== EVAM_CARD_NAME) return;
    
	var mappings = template.mappings;
	var staticValues = template.staticValues;
	if (!mappings.hasOwnProperty(BUTTON_LABEL_PROP) && !staticValues.hasOwnProperty(BUTTON_LABEL_PROP) || mappings[BUTTON_LABEL_PROP] === '') {
        gs.addErrorMessage(gs.getMessage("WARNING: The View Template is missing a mapping to the '") + BUTTON_LABEL_PROP + gs.getMessage("' field. Please add a mapping to this field or accessibilty issues may occur"));
	}
    if (!mappings.hasOwnProperty(CARD_LABEL_PROP) && !staticValues.hasOwnProperty(CARD_LABEL_PROP) || mappings[CARD_LABEL_PROP] === '') {
        gs.addErrorMessage(gs.getMessage("WARNING: The View Template is missing a mapping to the '") + CARD_LABEL_PROP + gs.getMessage("' field. Please add a mapping to this field or accessibilty issues may occur"));
    }

})(current, previous);
