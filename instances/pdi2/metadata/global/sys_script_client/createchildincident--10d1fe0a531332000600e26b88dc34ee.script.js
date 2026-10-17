function onLoad() {
	NOW._createChildIncident = function(srcSysId){
		var ga = new GlideAjax('IncidentUtils2');
		ga.addParam('sysparm_name', 'getIncidentQueryParams');
		ga.addParam('sysparm_src_sysid', srcSysId);
		ga.addParam('sysparm_ui_action', "create_child_incident");
		ga.setWantSessionMessages(true);
		ga.getXMLAnswer(function(queryParam){
			if (queryParam) {
				var ck;
				if (typeof g_ck != 'undefined' && g_ck != "")
					ck = g_ck;

				var gotoUrl = [];
				gotoUrl.push('srcSysID=' + srcSysId);
				gotoUrl.push('newSysID=$sys_id');
				gotoUrl.push('sysparm_returned_action=$action');
				if (ck)
					gotoUrl.push('sysparm_ck=' + ck);

				gotoUrl = 'CopyIncidentRelatedLists.do?' + gotoUrl.join('&');

				var form = cel('form', document.body);
				hide(form);
				form.method = "POST";
				form.action = "incident.do";
				if (ck)
					_addParam(form, 'sysparm_ck', g_ck);
				_addParam(form, 'sys_id', '-1');
				_addParam(form, 'sysparm_query', queryParam);
				_addParam(form, 'sysparm_goto_url', gotoUrl);
				form.submit();
				}else{
					g_form.addErrorMessage("Failed to create child incident");
				}
		});
	};
	function _addParam(form, name, val) {
		var inp = cel('textarea', form);
		inp.name = name;
		inp.value = val;
	}
}
