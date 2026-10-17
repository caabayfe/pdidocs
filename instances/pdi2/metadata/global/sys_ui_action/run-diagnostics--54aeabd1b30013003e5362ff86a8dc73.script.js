function _getDocument() {
	if (window.document)
		return window.document;
	
	if(inFrame()) {
		var iFrame = top.window.document.getElementById('gsft_main');
		if (iFrame) {
			return ((iFrame.contentDocument) ? iFrame.contentDocument : iFrame.contentWindow.document);
		}
	}
	return top.window.document;
}

function executeDiagnostics() {
	var map = new GwtMessage().getMessages(['Cancel', 'Cancel Execution', 'View Result', 'Close', 'Execute Diagnostics']);
	var dd = new GlideModal('simple_progress_viewer', true, '40em', '10em');
	dd.setTitle(map['Execute Diagnostics']);
	dd.setPreference('sysparm_ajax_processor', 'sn_pa_diagnostics.PADiagnosticsAjax');
	dd.setPreference('sysparm_scope', 'sn_pa_diagnostics');
	dd.setPreference('sysparm_ajax_processor_all', 'true');
	dd.setPreference('sysparm_ajax_processor_record_id', g_form.getUniqueValue());
	dd.setPreference('sysparm_ajax_processor_table', g_form.tableName);
	dd.setPreference('sysparm_renderer_expanded_levels', '0'); // collapsed root node by default
	dd.setPreference('sysparm_renderer_hide_drill_down', true);
	dd.setPreference('sysparm_button_close', map['Close']);

	// response from PADiagnosticsAjax is the progress worker id
    dd.on('executionStarted', function(response) {
		var trackerId = response.responseXML.documentElement.getAttribute('answer');
		var cancelBtn = new Element('button', {
			'id': 'sysparm_button_cancel',
			'type': 'button',
			'class': 'btn btn-default',
			'style': 'margin-left: 5px; float:right;'
		}).update(map['Cancel']);

        cancelBtn.onclick = function() {
			var dialog = new GlideDialogWindow('glide_ask_standard');
			dialog.setTitle(map['Cancel Execution']);
			dialog.setPreference('warning', true);
			dialog.setPreference('title', map['Cancel Execution']);
			dialog.setPreference('defaultButton', 'ok_button');
			dialog.setPreference('sysparm_scope', 'global');
			dialog.setPreference('onPromptComplete', function() {
				cancelBtn.disable();
				var ajaxHelper = new GlideAjax('sn_pa_diagnostics.PADiagnosticsAjax');
				ajaxHelper.addParam('sysparm_name', 'cancel');
				ajaxHelper.addParam('sysparm_trackerId', trackerId);
				ajaxHelper.getXMLAnswer(_handleCancelResponse);
			});
			dialog.render();
			dialog.on('bodyrendered', function() {
				var okBtn = _getDocument().getElementById('ok_button');
				if (okBtn) {
					okBtn.className += ' btn-destructive';
				}
			});
        };

		var _handleCancelResponse = function(answer) {
			var cancelBtn = _getDocument().getElementById('sysparm_button_cancel');
			if (cancelBtn)
				cancelBtn.remove();
		};

        var buttonsPanel = _getDocument().getElementById('buttonsPanel');
        if (buttonsPanel)
        	buttonsPanel.appendChild(cancelBtn);
	});

	dd.on('executionComplete', function(trackerObj){
		var cancelBtn = _getDocument().getElementById('sysparm_button_cancel');
		if (cancelBtn)
			cancelBtn.remove();

		var resultBtn = new Element('button', {
			'id': 'sysparm_button_result',
			'type': 'button',
			'class': 'btn btn-default',
			'style': 'margin-left: 5px;'
		}).update(map['View Result']);

		resultBtn.onclick = function() {
			_getDocument().location.href = trackerObj.result.url;
		};

        var buttonsPanel = _getDocument().getElementById('buttonsPanel');
        if (buttonsPanel)
        	buttonsPanel.insertBefore(resultBtn, buttonsPanel.firstChild);

		setTimeout(function(){
			var timeTaken = trackerObj.result.timeTaken;
			var timeMsg = new GwtMessage().getMessage('Diagnostics executed in {0}s. Click View Result button to view execution results.', timeTaken);
			var container = _getDocument().getElementById('container');
			var closeBtn = _getDocument().getElementById('sysparm_button_close');
			_getDocument().getElementById('buttonsPanel').style.paddingTop = '0px';
			if(trackerObj && container){
				var template =  "<div style='padding-top:6px;padding-bottom:6px;'> "
				+ "<span class='icon icon-check-circle' style='margin-right: 5px; float: left; color: #4FD965;'></span>"
				+ "<span style='padding-left:8px;'>$(timeMsg)</span> " +
				"</div>";
				template = template.replace('$(timeMsg)', timeMsg);
				container.innerHTML = template;
			}
			closeBtn.className = 'btn btn-primary';
			if (closeBtn) {
				closeBtn.on('click', function() {
					dd.destroy();
				});
			}
		},0);
	});

	dd.render();
}
