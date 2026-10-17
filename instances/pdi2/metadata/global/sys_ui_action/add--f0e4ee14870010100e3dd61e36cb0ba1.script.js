function openServiceOfferingsList(){
	var gajax = new GlideAjax("AssociateCIToTask");
	gajax.addParam("sysparm_name","getURL");
	gajax.addParam("sysparm_id", g_form.getUniqueValue());
	gajax.addParam("sysparm_add_to", "task_service_offering");

	gajax.getXMLAnswer(openListModal);
}

function openListModal(url) {
	var cmdbciModal = new GlideModal('task_add_affected_cis');
	cmdbciModal.setTitle(getMessage("Add Service Offerings"));
	cmdbciModal.setWidth(1200);
	cmdbciModal.setAutoFullHeight(true);
	cmdbciModal.on('beforeclose', function(){
		refreshServiceOfferings();
	});
	ScriptLoader.getScripts('/scripts/incident/glide_modal_accessibility.js', function() {
		cmdbciModal.template = glideModalTemplate;
		cmdbciModal.renderIframe(url, function(event) {
				glideModalKeyDownHandler(event, cmdbciModal.getID());
			});
	});
	var link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = 'styles/incident_glide_modal.css';
	document.head.appendChild(link);
}

function refreshServiceOfferings(){
	GlideList2.get(g_form.getTableName() + '.' + g_list.getRelated()).setFilterAndRefresh('');
}

function resizeIframe(){
    var x = g_glideBoxes.cm_add_affected_cis;
	x.autoDimension();
    x.autoPosition();
	x._createIframeShim();
}
