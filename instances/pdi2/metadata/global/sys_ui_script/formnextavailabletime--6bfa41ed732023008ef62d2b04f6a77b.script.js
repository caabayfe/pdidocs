function openNextAvailableTime() {
    var changeSysId = g_form.getUniqueValue();
    var dialogClass = GlideModal;
    var template = '<div id="#{HTML:id}" tabindex="-1" style="visibility: hidden;"' +
        'aria-hidden="true" class="modal" role="dialog" ' +
        'aria-labelledby="#{HTML:id}_title" data-readonly="#{HTML:readOnly}" data-has-help="#{HTML:showHelp}" focus-escape="#{HTML:focusEscape}" data-auto-focus="#{HTML:autoFocus}">' +
        '	<div class="modal-dialog #{size}">' +
        '		<div class="modal-content">' +
        '			<div class="modal-body container-fluid" style="overflow: hidden; height: 260px;"></div>' +
        '		</div>' +
        '	</div>' +
        '	<i class="focus-trap-boundary-south" tabindex="0"></i>' +
        '</div>';
    var nextAvailableDialog = new dialogClass("chg_next_available_time", false, 400, 400);
    nextAvailableDialog.template = template;
    nextAvailableDialog.on("closeconfirm", function() {
        setTimeout(function() {
            if (window.g_scratchpad.next_available_time.start_date && window.g_scratchpad.next_available_time.end_date) {
                g_form.setValue("start_date", window.g_scratchpad.next_available_time.start_date);
                g_form.setValue("end_date", window.g_scratchpad.next_available_time.end_date);
            }
        });
    });
    nextAvailableDialog.setPreference('focusTrap', true);
    nextAvailableDialog.setTitle(new GwtMessage().getMessage("Next Available Time"));
    nextAvailableDialog.renderIframe("chg_next_available_time.do?sysparm_stack=no&sysparm_changeId=" + changeSysId, function() {
        window.g_scratchpad.next_available_time = {};
        $j("#chg_next_available_time").css({
            visibility: "visible"
        });
        $j("#chg_next_available_time iframe").css({
            overflow: "hidden"
        });
    });
}
