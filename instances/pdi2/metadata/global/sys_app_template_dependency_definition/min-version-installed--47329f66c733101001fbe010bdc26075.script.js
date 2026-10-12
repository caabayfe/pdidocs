//is a specific scoped app at or above a minimum version?
(function(input) {
	if (!input.hasOwnProperty("scope_name") && input.hasOwnProperty("min_version"))
		return false;

    var gr = new GlideRecord("sys_scope");
    gr.addQuery("scope", input.scope_name);
    gr.query();

    if (!gr.next())
        return false;

    var currentVersion = gr.getValue("version");
    var vc = new sn_appclient.VersionComparator();

    //if they are equal then pass
    if (vc.isEqual(input.min_version, currentVersion))
        return true;

    //if the minimum version would be a downgrade from the current version
    //then we meet the minimum requirement
    return vc.isDowngrade(currentVersion, input.min_version);

})(input);
