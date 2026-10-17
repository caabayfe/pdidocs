function openCmdbCIList(){
	var gajax = new GlideAjax("AssociateCIToTask");
	gajax.addParam("sysparm_name","getURL");
	gajax.addParam("sysparm_id", g_form.getUniqueValue());
	gajax.addParam("sysparm_add_to", "task_ci");

	gajax.getXMLAnswer(openList);
}

function openList(url){
	var cmdbciModal = new GlideModal('task_add_affected_cis');
	cmdbciModal.setTitle(getMessage("Add Affected CIs"));
	cmdbciModal.setWidth(1200);
	cmdbciModal.setAutoFullHeight(true);
	cmdbciModal.on('beforeclose', function(){
		refreshAffectedCIs();
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

function refreshAffectedCIs() {
	var listId = g_form.getTableName() + ".task_ci.task";

	var list = typeof GlideList2 !== "undefined" ? GlideList2.getByName(listId) : null;
	if (list == null)
		list = typeof GlideList !== "undefined" ? GlideList.get(listId) : null;

	if (list != null)
		list.refresh();
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
