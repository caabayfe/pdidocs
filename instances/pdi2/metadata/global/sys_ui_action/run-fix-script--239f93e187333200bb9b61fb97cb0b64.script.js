function runFixScriptModal() {
	var modalTitle = 'Run Fix Script';
	var msgMap = new GwtMessage().getMessages([modalTitle, 'Fix script {0} not found']);

	var sysId;
	if (typeof rowSysId == 'undefined')
		sysId = gel('sys_uniqueValue').value;
	else
		sysId = rowSysId;

	// This is a DERT-approved confirm modal. It will be updated to standards as is necessary.
	// It is not recommended to make runtime CSS modifications after rendering the modal due to the potential for future changes.
	var modalTemplate = '<div id="run_fix_script_modal" tabindex="-1" ' +
		'aria-hidden="true" class="modal" role="dialog" ' +
		'aria-labelledby="run_fix_script_modal_title" data-readonly="true">' +
			'	<div class="modal-dialog modal-sm">' +
			'		<div class="modal-content">' +
			'			<header class="modal-header" style="border-bottom: 0 solid #e5e5e5; font-size:18px;padding: 10px 10px 0 10px">' +
			'				<h4 id="run_fix_script_modal_title" class="modal-title"style="font-size:18px;">' + msgMap[modalTitle] +'</h4>' +
			'			</header>' +
			'		<div class="modal-body"/>' +
			'		</div>' +
			'	</div>' +
			'	<i class="focus-trap-boundary-south" tabindex="0"></i>' +
			'</div>';

	var gr = new GlideRecord('sys_script_fix');
	gr.addQuery("sys_id", sysId);
	gr.query();
	if (gr.next()) {
          var dialog = new GlideModal("run_fix_script_modal", true);
          dialog.template = modalTemplate;
          dialog.setPreference("sysparm_sys_id", gr.sys_id);
          dialog.setPreference("sysparm_script_name", gr.name);
          dialog.setPreference("focusTrap", true);
          dialog.render();
	} else
		alert(new GwtMessage().format(msgMap['Fix script {0} not found'], sysId));
}
