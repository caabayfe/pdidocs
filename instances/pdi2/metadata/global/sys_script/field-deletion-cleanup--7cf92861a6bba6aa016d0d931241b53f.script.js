// Deletes all onChange() Client Scripts and UI Policy Actions for the deleted field

var wasEnabled = gs.enableDomain(false);
try {
   
// if next_element is not nil, then update if value is different from element value, ignore otherwise 
var next = current.next_element;
if(next != null && !next.nil()) {
   var element = current.element;
   if(next != element) {
   	var cs = getRelatedClientScripts(current);
	   while(cs.next()) {
	   	cs.setValue('field', next);
		   cs.update();
	   }
	   var supa = getRelatedUIPolicyActions(current);
	   while(supa.next()) {
	   	supa.setValue('field', next);
		   supa.update();
	   }
   }
} else {
   
// next_element is nil, so simply delete
var cs = getRelatedClientScripts(current);
while (cs.next()) {
  gs.log("Deleted '" + cs.name + "' onChange Client Script for deleted field: " + current.name + "." + current.element);
  var msg = gs.getMessage("Deleted '{0}' onChange Client Script for deleted field", cs.name) + 
    ": " + current.name + "." + current.element;
  gs.addInfoMessage(msg);
  cs.deleteRecord();
}

var supa = getRelatedUIPolicyActions(current);
if (supa.hasNext()) {
  gs.log("Deleted all UI Policy Actions for deleted field: " + current.name + "." + current.element);
  gs.addInfoMessage(gs.getMessage("Deleted all UI Policy Actions for deleted field") + ": " + current.name + "." + current.element);
}
while (supa.next())
  supa.deleteRecord();
}

} finally {
	gs.enableDomain(wasEnabled);
}

function getRelatedClientScripts(current) {
	var cs = new GlideRecord('sys_script_client');
	if(!cs.isValid())
		return cs;
		
	cs.addQuery('table',current.name);
	cs.addQuery('field',current.element);
	cs.addQuery('type', ['onChange', 'onCellEdit']);
	cs.query();
    return cs;
}

function getRelatedUIPolicyActions(current) {
	var supa = new GlideRecord('sys_ui_policy_action');
	if(!supa.isValid())
		return supa;
		
	supa.addQuery('table',current.name);
	supa.addQuery('field',current.element);
	supa.query();
    return supa;
}
	
