function openChangeRequestList(){
	var gajax = new GlideAjax("BulkAddChangeRequest");
	gajax.addParam("sysparm_name","getURL");
	gajax.addParam("sysparm_sys_id", g_form.getUniqueValue());
	gajax.getXMLAnswer(openListModalChange);
}

function openListModalChange(url){
	//render the modal
	var chngModal = new GlideModal('task_add_change_req');
	chngModal.setTitle(getMessage("Add Change Requests"));
	chngModal.setWidth(1200);
	chngModal.setAutoFullHeight(true);
	chngModal.on('beforeclose', function(){
		refreshChangeRelatedList();
		if (chngModal.resultString) {
			var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
			errMessageDialog = new dialogClass("change_bulk_add_fail", false, 648, 250);
			errMessageDialog.setTitle(new GwtMessage().getMessage("Failed to add Changes"));
			var errObj = JSON.parse(chngModal.resultString);
			errMessageDialog.setPreference('sysparm_chg_count', errObj.failedChgNum.length);
			errMessageDialog.setPreference('sysparm_chg_id', errObj.failedChgNum.join(', '));
			errMessageDialog.render();
		}

	});
	ScriptLoader.getScripts('/scripts/incident/glide_modal_accessibility.js', function() {
		chngModal.template = glideModalTemplate;
		chngModal.renderIframe(url, function(event) {
				glideModalKeyDownHandler(event, chngModal.getID());
			});
	});

	var link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = 'styles/list_add_glide_modal.css';
	document.head.appendChild(link);
}

function refreshChangeRelatedList() {
	GlideList2.get(g_form.getTableName() + '.' + g_list.getRelated()).setFilterAndRefresh('');
}
