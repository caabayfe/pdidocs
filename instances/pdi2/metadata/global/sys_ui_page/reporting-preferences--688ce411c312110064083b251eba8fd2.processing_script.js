doAction();

var lastURL = gs.getSession().getStack().purge("reporting_preferences.do");
if (lastURL == "welcome.do")
   lastURL = "home.do";

response.sendRedirect(lastURL);

function doAction() {
  if (sys_action == 'cancel') {
  }

  if (sys_action == 'save') {
	 var showUsrGrp = getParameterByName('show_usr_grp');
  
	 var gr = new GlideRecord('sys_user_preference'); 
     gr.addQuery('name', 'report_home.group_report.show_first_group_user');
     gr.addQuery('user', gs.getUserID());
     gr.query();
     if (gr.next() ) {
		gr.setValue('type', 'boolean');
        gr.setValue('value', showUsrGrp);
        gr.update();
     } else {
        gr.initialize();
        gr.setValue('name', 'report_home.group_report.show_first_group_user');
        gr.setValue('user', gs.getUserID());
        gr.setValue('type', 'boolean');
        gr.setValue('value', showUsrGrp);
        gr.insert();
     } 			
     
  }
}

function getParameterByName(name) {
   var v = request.getParameterValues(name);
   return v[0];
}
