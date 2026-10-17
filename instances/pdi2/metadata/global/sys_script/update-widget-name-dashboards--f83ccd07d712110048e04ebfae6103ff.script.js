updateWidgetName();

function updateWidgetName() {  
	//gs.log("widget sysid=" + current.sys_id);
	//gs.log("widget name=" + current.name);
	var gr = new GlideRecord('sys_portal_preferences'); 
  gr.addQuery('name','sys_id');
  gr.addQuery('value',current.sys_id);
  gr.query();
  var widgetsUpdated = 0;
  while (gr.next()) {
	  //gs.log("gr.get('portal_section')=" + gr.getValue('portal_section'));
      var grUpdate = new GlideRecord('sys_portal_preferences');
	  grUpdate.addQuery('portal_section',gr.getValue('portal_section'));
	  grUpdate.addQuery('name','title');
	  grUpdate.query();
	  while (grUpdate.next()) {
		  //gs.log("found 1 widget.");
		  grUpdate.value = current.name;
		  grUpdate.update(); 
		  widgetsUpdated++;
	  }
  }
	
  //gs.log("# widgets updated="+widgetsUpdated);
}
