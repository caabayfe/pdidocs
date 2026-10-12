function OnCopyChangeClick() {
	function addParam(form, name, val) {
		var inp = cel('textarea', form);
		inp.name = name;
		inp.value = val;
	}

	var srcSysId = g_form.getUniqueValue();

	var ga = new GlideAjax('ChangeUtils');
	ga.addParam('sysparm_name', 'getChangeQueryParams');
	ga.addParam('sysparm_src_sysid', srcSysId);
	ga.setWantSessionMessages(true);
	ga.getXMLAnswer(function (queryParam) {
		if (queryParam) {
			var gotoURL = new GlideURL('CopyChangeRelatedLists.do');
			gotoURL.setEncode(false);
			gotoURL.addToken();
			gotoURL.addParam('srcSysID', srcSysId);
			gotoURL.addParam('newSysID', '$sys_id');
			gotoURL.addParam('sysparm_returned_action', '$action');

			var form = cel('form', document.body);
			hide(form);
			form.method = "POST";
			form.action = g_form.getTableName() + ".do";
			if (typeof g_ck != 'undefined' && g_ck != "")
				addParam(form, 'sysparm_ck', g_ck);
			addParam(form, 'sys_id', '-1');
			addParam(form, 'sysparm_query', queryParam);
			addParam(form, 'sysparm_goto_url', gotoURL.getURL());
			form.submit();
		}
	});
}
