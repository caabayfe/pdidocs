function openCmdbCIServiceList(){
	var gajax = new GlideAjax("AssociateCIToTask");
	gajax.addParam("sysparm_name","getURL");
	gajax.addParam("sysparm_id", g_form.getUniqueValue());
	gajax.addParam("sysparm_add_to", "task_cmdb_ci_service");

	gajax.getXMLAnswer(openServicesList);
}

function openServicesList(url) {
	var cmdbciModal = new GlideModal('task_add_affected_cis');
	cmdbciModal.setTitle(getMessage("Add Impacted Services/CIs"));
	cmdbciModal.setWidth(1200);
	cmdbciModal.setAutoFullHeight(true);
	cmdbciModal.on('beforeclose', function(){
		refreshImpactedServices();
	});
	ScriptLoader.getScripts('/scripts/incident/glide_modal_accessibility.js', function() {
		cmdbciModal.template = glideModalTemplate;
		cmdbciModal.renderIframe(url, function(event) {
				glideModalKeyDownHandler(event, cmdbciModal.getID());
			});
		document.getElementById("task_add_affected_cis").removeAttribute("tabindex");
	});
	var link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = 'styles/incident_glide_modal.css';
	document.head.appendChild(link);
}

function refreshImpactedServices(){
	GlideList2.get(g_form.getTableName() + '.' + g_list.getRelated()).setFilterAndRefresh('');
	var modal = window.GlideModal.prototype.get('task_add_affected_cis');
	if (modal && modal.message)
		g_form.addInfoMessage(modal.message);
}

function resizeIframe(){
    var x = g_glideBoxes.cm_add_affected_cis;
	x.autoDimension();
    x.autoPosition();
	x._createIframeShim();
}
