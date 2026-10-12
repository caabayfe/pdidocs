var controller = new GlideController();
var approvalSource = controller.getGlobal("approvalSource");
var emailGlobal = undefined;
if (typeof email !== "undefined")
   emailGlobal = email;
if (approvalSource == "email" || typeof emailGlobal !== "undefined")
	current.approval_source = "email";

else {
	var device = GlideMobileExtensions.getDeviceType();
	if (device == "m" || device == "mobile")
		current.approval_source = "ui.mobile";
	else if (device == "tablet")
		current.approval_source = "ui.tablet";
	else
		current.approval_source = "ui.desktop";
}
