function gotoChangeForm() {
	var cis = g_list.getChecked().toString();
	if (cis) {
		var tableLabel = g_list.getTitle();
		var ga = new GlideAjax('AssociateCIsToChangeUtil');
		ga.addParam('sysparm_name', 'storeCIsAndPostInfoMsg');
		ga.addParam('sysparm_selected_cis', cis);
		ga.addParam('sysparm_table_label', tableLabel);
		ga.addParam('sysparm_want_session_messages', 'false');
		ga.getXMLAnswer(function(result) {
			if (result) {
				var parms = [];
				parms.push('sysparm_skipmsgs=true');
				parms.push('sysparm_stack=no');
				parms.push('sysparm_returned_action=$action');
				parms.push('sysparm_returned_sysid=$sys_id');
				parms.push('sysparm_table_label=' + encodeURIComponent(tableLabel));
				parms.push('sysparm_ck=' + g_ck);

				var gotoUrl = encodeURIComponent('associate_cis_to_change.do?' + parms.join('&'));
				var url = 'change_request.do?sys_id=-1&sysparm_goto_url=' + gotoUrl;

				var cIndex = cis.indexOf(',');
				if (cIndex === -1 || cIndex === cis.length - 1) {
					var data = JSON.parse(result.replace('com.snc.change_request.AssociateCIsToChangeUtil.selected_cis_', ''));
					var field = data.classname || 'cmdb_ci';
					var sysId = data.sys_id || '';
					var parentField = data.parent_sys_id || '';
					var parentSysId = data.parent_classname || '';
					var query = field + '=' + sysId;
					if (data.parent_sys_id && data.parent_classname)
						query += '^' + data.parent_classname + '=' + data.parent_sys_id;

					// If only one CI populate the correct field on the Change Form
					url += '&sysparm_query=' + encodeURIComponent(query);
				}

				g_navigation.open(url);
			}
		});
	}
}
