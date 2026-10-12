function onLoad() {
	reWriteLinkToEndpoint();
	CustomEvent.un("partial.page.reload", reWriteLinkToEndpoint);
	CustomEvent.observe("partial.page.reload", reWriteLinkToEndpoint);
}

function reWriteLinkToEndpoint(){
	//PRB826341 specifying related list by id, this client script should affect only the entry-points list.
	$$("tr[data-list_id='cmdb_ci_service_discovered.sa_m2m_service_entry_point.cmdb_ci_service']").each(function(row){
		var sysId = row.readAttribute('sys_id');
		var a = row.select('a');
		a.each(function(anchor){
			anchor.observe('click', function (evt, element){
				evt.stop();
				redirectToEndPoint(sysId, anchor.innerText);
			});
		});
	});
}

function redirectToEndPoint(sysId, title){
	var gr = new GlideRecord('sa_m2m_service_entry_point');
	gr.addQuery('sys_id', sysId);
	gr.query(recResponce);

	function recResponce(res){
		if (res.next()) {
			var epId = res.cmdb_ci_endpoint + '';
			var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
			var dlg = new dialogClass('sa_add_connection');
			dlg.setTitle(getMessage('Edit entry point'));
			dlg.setWidth(600);
			setPreference('edit_entry_point_id',epId);
			dlg.render();
		}
	}
}
