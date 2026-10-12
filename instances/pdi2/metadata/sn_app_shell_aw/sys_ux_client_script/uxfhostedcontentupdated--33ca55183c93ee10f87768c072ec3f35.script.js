function uxfHostedContentUpdated({ api, event, helpers, imports }) {
	const BreadcrumbUtils = imports["sn_app_shell_aw.BreadcrumbAppshellUtils"]();
	BreadcrumbUtils.handleUxfHostedContentUpdated(api, event, helpers, imports);
}
