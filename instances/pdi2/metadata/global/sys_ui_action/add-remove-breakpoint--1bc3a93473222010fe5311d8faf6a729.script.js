var stepID = current.getUniqueValue();
var userID = gs.getUser().getID();

var gr = new GlideRecord("atf_breakpoint");
gr.addQuery("step", stepID);
gr.addQuery("user", userID);
gr.query();

if (!gr.next()) {
	gr = new GlideRecord("atf_breakpoint");
	gr.setValue("active", true);
	gr.setValue("step", stepID);
	gr.setValue("user", userID);
	if (!gr.insert())
		gs.warn("Failed to insert breakpoint on step with sys_id " + stepID + " with user " + gs.getUser().getName());

} else
	gr.deleteRecord();

action.setRedirectURL(parent);
