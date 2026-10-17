var gFormAlreadySubmitted = false;

function onSubmit() {
	if(gFormAlreadySubmitted || !g_form.modified)
		return true;

	var localOrExisting = g_form.getValue('local_or_existing');
	var securityAttribute = g_form.getValue('security_attribute');
	var currCondition = g_form.getValue('security_attribute.condition');
	// check if neither securityAttribute or condition is set, then no need to proceed
	if (!securityAttribute && !currCondition)
		return true;

	var prevLocalOrExisting = g_form.getElement('sys_original.' + g_form.getElement('local_or_existing').id).value;
	var prevAttribute = g_form.getElement('sys_original.' + g_form.getElement('security_attribute').id).value;
	if ('Local' === localOrExisting)
		handleLocal(currCondition);
	else if ('Existing' === localOrExisting)
		handleExisting(prevLocalOrExisting, prevAttribute);
}

function handleLocal(currCondition) {
	if (!currCondition) {
		g_form.setValue('security_attribute', '');
		return;
	}

	// For a new record, create New attribute anyways
	if (g_form.isNewRecord()) {
		createSecurityAttribute(currCondition);
	} else { // For an existing record, create or update attribute accordingly
		updateOrCreateLocalSA(currCondition);
	}

	gFormAlreadySubmitted = true;
}

function updateOrCreateLocalSA(currCondition) {
	var labelAndName = _getLabelAndName();
	var ga = new GlideAjax('global.SecurityAttributeUtil');
	ga.addParam('sysparm_name', 'updateOrCreateLocalSA');
	ga.addParam('sysparm_label', labelAndName[0]);
	ga.addParam('sysparm_name0', labelAndName[1]);
	ga.addParam('sysparm_condition', currCondition);
	ga.getXMLWait();
	var answer = ga.getAnswer();
	g_form.setValue('security_attribute', answer);
	g_form.setValue('security_attribute.condition', currCondition);
}

function createSecurityAttribute(currCondition) {
	var labelAndName = _getLabelAndName();

	var ga = new GlideAjax('global.SecurityAttributeUtil');
	ga.addParam('sysparm_name', 'createSecurityAttribute');
	ga.addParam('sysparm_label', labelAndName[0]);
	ga.addParam('sysparm_name0', labelAndName[1]);
	ga.addParam('sysparm_condition', currCondition);
	ga.getXMLWait();
	var answer = ga.getAnswer();
	g_form.setValue('security_attribute', answer);
	g_form.setValue('security_attribute.condition', currCondition);
}

function handleExisting(prevLocalOrExisting, prevAttribute) {
	if ('Local' === prevLocalOrExisting)
		deletePrevLocalAttribute(prevAttribute);
	// if it's Existing, no-op

	gFormAlreadySubmitted = true;
}

function deletePrevLocalAttribute(prevAttribute) {
	var ga = new GlideAjax('global.SecurityAttributeUtil');
	ga.addParam('sysparm_name', 'deletePrevLocalAttribute');
	ga.addParam('sysparm_attribute_id', prevAttribute);
	ga.getXML();
}

function _getLabelAndName() {
	var labelAndName = [];
	var label = 'ACL_' + g_form.getUniqueValue();
    var scope = g_scratchpad.scope;
	var prefix = (!scope || scope == 'global') ? '' : scope + '__';
	var name = prefix + label;
	labelAndName.push(label, name);
	return labelAndName;
}
