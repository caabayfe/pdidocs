function openIncidentList(){
	var gajax = new GlideAjax("BulkAddIncidents");
	gajax.addParam("sysparm_name","getURL");
	gajax.addParam("sysparm_sys_id", g_form.getUniqueValue());
	gajax.addParam("sysparm_parent_table", g_form.getTableName());
	gajax.getXMLAnswer(openListModalIncident);
}

function openListModalIncident(url){
	//render the modal
	var incModal = new GlideModal('incident_add_records');
	incModal.setTitle(getMessage("Add Incidents"));
	incModal.setWidth(1200);
	incModal.setAutoFullHeight(true);
	incModal.on('beforeclose', function(){
		refreshRelatedIncidents();
	});
	ScriptLoader.getScripts('/scripts/incident/glide_modal_accessibility.js', function() {
		incModal.template = glideModalTemplate;
		incModal.renderIframe(url, function(event) {
				glideModalKeyDownHandler(event, incModal.getID());
			});
	});

	var link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = 'styles/incident_glide_modal.css';
	document.head.appendChild(link);
}

function refreshRelatedIncidents() {
	GlideList2.get(g_form.getTableName() + '.' + g_list.getRelated()).setFilterAndRefresh('');
}
