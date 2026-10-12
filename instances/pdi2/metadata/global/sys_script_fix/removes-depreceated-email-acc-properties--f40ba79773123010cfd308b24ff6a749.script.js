removeDepreceatedRecords();
function removeDepreceatedRecords() {
 	if (pm.isZboot())
		return;
  gs.log("--- Executing Fix Script : Removes Depreceated Email Account Properties ----");
	var gr = new GlideRecord('sys_properties');
	gr.addQuery('name','IN','glide.pop3.port,glide.smtp.auth,glide.pop3.secure,glide.smtp.encryption,glide.pop3.password');
	gr.query();
	while(gr.next()){
		var isDeleted = gr.deleteRecord();
    if(isDeleted)
		  gs.log(gr.getValue("name") + " has been removed");
	}
  gs.log("--- End of Fix Script Execution : Removes Depreceated Email Account Properties ----");
}
