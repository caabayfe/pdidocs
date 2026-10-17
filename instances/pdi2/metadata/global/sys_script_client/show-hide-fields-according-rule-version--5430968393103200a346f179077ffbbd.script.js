function onLoad() {
	if (g_form.getValue('name') == '')
		return;
	if (g_form.getValue('rule_version') == 'jakarta') {
	   g_form.addErrorMessage(new GwtMessage().getMessage('Deprecated view of event rule. To view the rule in the event rule designer, click \'View in designer\'.'));
	   
	   //Hide related lists
		var matchList = $$('div[tab_list_name_raw="em_match_rule.em_match_field.match_rule"]')[0];
		var composeList = $$('div[tab_list_name_raw="em_match_rule.em_compose_field.match_rule"]')[0];
		if(matchList && matchList.hasClassName && matchList.hasClassName('embedded'))
		   matchList.hide();
		if(composeList && composeList.hasClassName && composeList.hasClassName('embedded'))
		   composeList.hide();
	  
	   //scan all fields on form
	   g_form.elements.forEach(function (e, i) {
		   g_form.setMandatory(e.fieldName, false);
		   if (e.fieldName == 'name' || e.fieldName == 'active' || 
			   e.fieldName == 'event_class' || e.fieldName == 'description') {
			   //show the field as read only
				g_form.setReadOnly(e.fieldName, true);
		   } else {
			   //hide the field
				g_form.setVisible(e.fieldName, false);
		   }
		}
	);

   } else {
	   g_form.addInfoMessage(new GwtMessage().getMessage('Rule cannot be viewed in the event rule designer. To modify the rule click \'Save and Upgrade\'.'));
   }
	
   
}
