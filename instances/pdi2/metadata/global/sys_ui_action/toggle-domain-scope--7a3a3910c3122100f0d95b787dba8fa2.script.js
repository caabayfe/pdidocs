function onToggleDomainScope() {
	//Check the current domain scope and based on that toggle to record/session scope
	var currentScopeElement = gel('sysparm_domain_scope');
	if (currentScopeElement) {
		toggleScope(currentScopeElement);
		refreshAllLists();
		sendSecurityEvent();
        CustomEvent.fire('domain_scope_changed');
	}
}

function toggleScope(currentScopeElement) {
	var currentScope = currentScopeElement.value;
	if (currentScope == 'record')
		switchScope(currentScopeElement, 'session', 'session', 'inline');
	else if (currentScope == 'session')
		switchScope(currentScopeElement, gel('sysparm_record_domain').value, 'record', 'none');
}

function switchScope(currentScopeElement, formDomain, newScope, displayValue) {
	var domainElement = gel('sysparm_domain');
	if (domainElement) {
		domainElement.value = formDomain;
		//change the scope so that toggle works
		currentScopeElement.value = newScope;
		toggleNotification(displayValue);
	}
}

function toggleNotification(displayValue) {
	var alertPreferenceElement = gel('sysparm_domain_alert_preference');
	if (!alertPreferenceElement || alertPreferenceElement.value != 'true')
		return;

	if (displayValue == 'inline') {
		var infoMessageElement = gel('domain_alert');
		if (!infoMessageElement)
			g_form.addInfoMessage(getMessage('Domain scope expanded!'), 'domain_alert');
		else
			infoMessageElement.show();
	}
	else {
		//wipeout everything including close button, if there's no other ouput messages div
		if (GlideUI.get()._getOutputMessageDivs().container.childNodes.length == 1) {
			g_form.clearMessages();
			return;
		}

		var infoMessageElement = gel('domain_alert');
		if (infoMessageElement)
			infoMessageElement.hide();
	}
}

function refreshAllLists() {
	var id;
	var domainElement = gel('sysparm_domain');
	var scopeElement = gel('sysparm_domain_scope');
	if (domainElement && domainElement.value) {
		for (id in GlideLists2) {
			GlideLists2[id].setSubmitValue('sysparm_domain', domainElement.value);
			if (scopeElement && scopeElement.value)
				GlideLists2[id].setSubmitValue('sysparm_domain_scope', scopeElement.value);
			GlideLists2[id].refresh();
		}	
	}
	if (typeof GlideList !== 'undefined') {
		for (id in GlideList.lists) {
			var list = GlideList.get(id);
			list.setSubmitValue('sysparm_domain', domainElement.value);
			if (scopeElement && scopeElement.value)
				list.setSubmitValue('sysparm_domain_scope', scopeElement.value);
			list.refresh();
		}
	}
}

function sendSecurityEvent() {
	var ga = new GlideAjax('SecurityEventSender');
	ga.addParam('sysparm_eventName', 'domain_toggle');
	ga.addParam('sysparm_parm1', '');
	ga.addParam('sysparm_parm2', '');
	ga.getXML();
}
