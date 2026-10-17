function getUrl(mode) {
	var changeSysId = g_form.getUniqueValue();
	var urlSuffix = "?sysparm_nostack=true&sysparm_chg_id=" + changeSysId + "&sysparm_ck=" + g_form.getValue('sysparm_ck') + "&sysparm_mode=" + mode;
	if (mode === "modal")
		return "/change_risk_details_app.do" + urlSuffix;
	return "/change_risk_details_page.do" + urlSuffix;
}

function toggleRiskDetails(evt) {
	evt = evt || window.event;
	var popup = nowapi.g_popup_manager;
	popup.showPopup(evt, getUrl("popover"), { trapFocus: true, "width": "100%"});
}

function openRiskDetails() {
	var title = new GwtMessage().getMessage("Risk Details");
	var dialogClass = GlideModal;
	var template = '<div id="#{HTML:id}" tabindex="-1" style="visibility: hidden;"' +
		'aria-hidden="true" class="modal" role="dialog" ' +
		'aria-label="' + title + '" data-readonly="#{HTML:readOnly}" data-has-help="#{HTML:showHelp}" focus-escape="#{HTML:focusEscape}" data-auto-focus="#{HTML:autoFocus}">' +
		'	<div class="modal-dialog #{size}">' +
		'		<div class="modal-content">' +
		'			<div class="modal-body container-fluid" style="overflow: hidden; height: 260px;"></div>' +
		'		</div>' +
		'	</div>' +
		'	<i class="focus-trap-boundary-south" tabindex="0"></i>' +
		'</div>';
	var riskDetailsDialog = new dialogClass("chg_risk_details", false, 400, 400);
	riskDetailsDialog.template = template;
	riskDetailsDialog.setPreference('focusTrap', true);
	riskDetailsDialog.setTitle(title);
	riskDetailsDialog.renderIframe(getUrl("modal"), function() {
		window.g_scratchpad.next_available_time = {};
		$j("#chg_risk_details").css({
			visibility: "visible"
		});
		$j("#chg_risk_details iframe").css({
			overflow: "hidden"
		});
	});
}
