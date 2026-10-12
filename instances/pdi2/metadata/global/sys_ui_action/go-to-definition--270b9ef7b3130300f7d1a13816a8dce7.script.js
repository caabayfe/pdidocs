var ep = new GlideRecord("sys_extension_point");
ep.addQuery("api_name", current.getValue("point"));
ep.query();

if (ep.next())
	action.setRedirectURL(ep);

else {
	gs.addErrorMessage(gs.getMessage("Unable to locate extension point."));
	action.setRedirectURL(current);
}
