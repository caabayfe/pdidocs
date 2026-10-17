function showDifference() {
	var url = new GlideURL("StdChgProposalDiffViewer.do");
	url.addParam("sysparm_stack", "no");
	url.addParam("sysparm_proposalSysId", g_form.getUniqueValue());

	var proposalDiffOverlay = new GlideOverlay({
		id : "std_chg_proposal_diff",
		title : getMessage("Standard Change Proposal : Difference between currently published and proposed values"),
		iframe : url.getURL(),
		closeOnEscape : true,
		onAfterLoad: resizeIframe,
		showClose : true,
		height : "90%",
		width : "90%"
	});

	proposalDiffOverlay.center();
	proposalDiffOverlay.render();
}

function resizeIframe(){
    var x = g_glideBoxes.std_chg_proposal_diff;
	x.autoDimension();
    x.autoPosition();
	x._createIframeShim();
}
