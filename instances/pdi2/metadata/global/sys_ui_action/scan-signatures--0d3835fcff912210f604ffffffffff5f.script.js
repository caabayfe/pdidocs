function scanUpdateSetForSignatures() {
	var sysId = g_form.getUniqueValue();
	var tableName = g_form.getTableName();
	var title = getMessage('Execute Update Scan');
	
	var dd = new GlideModal('hierarchical_progress_viewer', false, '40em', '10.5em');
    dd.setTitle(title);

    dd.setPreference('sysparm_ajax_processor', 'CodeSigningUpdateSetScanWorker');
	dd.setPreference('sysparm_sys_id', sysId);
	dd.setPreference('sysparm_table_name', tableName);
    dd.setPreference('sysparm_setBackground', true);

    dd.on("executionComplete", function() {
		var resultBtn = new Element('button', {
            'id': 'sysparm_button_result_page',
            'type': 'button',
            'class': 'btn btn-primary',
            'style': 'margin-left: 5px; float:right;'
        }).update(getMessage('Go to Result'));

		resultBtn.onclick = function() {
			var table = 'sn_cse_update_set_signature_state';
			var filter = 'remote_update_set=' + sysId;
			var view = 'remote';
			var url = '/' + table + '_list.do?sysparm_query=' + encodeURIComponent(filter) + '&sysparm_view=' + encodeURIComponent(view);
			window.open(url, '_blank');

			// Close dialog
			dd.destroy();
			reloadWindow(window);
		};

        var buttonsPanel = $("buttonsPanel");
        if (buttonsPanel)
            buttonsPanel.appendChild(resultBtn);
    });

    dd.render();
}
