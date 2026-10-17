run();

// if auto-enroll is checked, need to make sure a EnrollmentCheck script
// is provided and has isEnrolled method defined. Otherwise, a default
// script will be provided which always returns true for isEnrolled.
function run() {
	
	if (current.is_enrolled.nil()) {
		var gr = new GlideRecord('sys_script_include');
		gr.addQuery('name', 'PwdAlwaysEnrolled');
		gr.query();
		if (gr.next()) {
			current.is_enrolled = gr.sys_id;
			var infoMsg = gs.getMessage("Because you did not specify an 'Enrollment check' script, the system will use a default script");
			gs.addInfoMessage(infoMsg);
		} else {
			// somehow the default script is missing, have user supply one
			var errMsg = gs.getMessage("You must specify an 'Enrollment check' script'");
			gs.addErrorMessage(errMsg);
			current.setAbortAction(true);
		}
	}
}
