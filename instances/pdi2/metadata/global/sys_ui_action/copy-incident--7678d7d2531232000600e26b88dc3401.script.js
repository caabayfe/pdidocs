function OnCopyIncidentClick(){
	var srcSysId = g_form.getUniqueValue();
	var ga = new GlideAjax('IncidentUtils2');
	ga.addParam('sysparm_name', 'getIncidentQueryParams');
	ga.addParam('sysparm_src_sysid', srcSysId);
	ga.addParam('sysparm_ui_action', "copy_incident");
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
			gotoUrl.push('sysparm_ui_action=copy_incident');
			if (ck)
				gotoUrl.push('sysparm_ck=' + ck);

			gotoUrl = 'CopyIncidentRelatedLists.do?' + gotoUrl.join('&');

			var form = cel('form', document.body);
			hide(form);
			form.method = "POST";
			form.action = g_form.getTableName() + ".do";
			if (ck)
				addParam(form, 'sysparm_ck', g_ck);
			addParam(form, 'sys_id', '-1');
			addParam(form, 'sysparm_query', queryParam);
			addParam(form, 'sysparm_goto_url', gotoUrl);
			form.submit();
		}else{
			g_form.addErrorMessage("Failed to copy incident");
		}
	});
}
function addParam(form, name, val) {
	var inp = cel('textarea', form);
	inp.name = name;
	inp.value = val;
}
