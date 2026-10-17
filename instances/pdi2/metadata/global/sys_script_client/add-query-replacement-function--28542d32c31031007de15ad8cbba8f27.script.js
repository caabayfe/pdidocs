function onLoad() {
	g_late_load_functions.push(function() { 
		updateExampleRewrite(); 
		var msg = gel("example_rewrite_msg");
		if (msg) {
			msg.hide();
		}
	});
}
function updateExampleRewrite() {
	var type = g_form.getValue("type")+'';
	var replacement = g_form.getValue("replacement"+'');
	var query = g_form.getValue("example_query")+'';
	var lookup = (g_form.getValue("lookup_key")+'').trim();
	
	var rewrite;
	if ("query_replacement" == type) {
		showQueryRewrite(replacement);
	} else if ("regex_replacement" == type) {
	    // Use GlideAjax for client script to access java RegexReplacementRewrite class
		var ajax = new GlideAjax('QueryRewriteAjax');
		ajax.addParam('sysparm_name', 'getExampleRewrite');
		ajax.addParam('sysparm_query', query);
		ajax.addParam('sysparm_lookup', lookup);
		ajax.addParam('sysparm_replacement', replacement);
		ajax.getXMLAnswer(showQueryRewrite);
	} else {
		// PG handles index hints differently from MariaDB		
		if (_isPgIndexHint()) {
			_updateExamplePgIndexHint(query, replacement);
		} else if (typeof lookup === 'undefined' || !lookup || lookup.length === 0) {
			showQueryRewrite('');
		} else {
			// Do find-replace with highlighting
			rewrite = query.split(lookup).join(
				"<span style='font-weight:bold;background-color:yellow'>" + replacement + "</span>"
			);
			showQueryRewrite(rewrite);
		}
	}

	function showQueryRewrite(rewrite) {
		// Bold sql keywords
		rewrite = rewrite.split(/select/gi).join("<b>SELECT</b>");
		rewrite = rewrite.split(/from/gi).join("<br /><b>FROM</b>");
		rewrite = rewrite.split(/where/gi).join("<br /><b>WHERE</b>");
		rewrite = rewrite.split(/join/gi).join("<b>JOIN</b><br />&nbsp;&nbsp;&nbsp;");
		rewrite = rewrite.split(/group by/gi).join("<br /><b>GROUP BY</b>");
		rewrite = rewrite.split(/having/gi).join("<br /><b>HAVING</b>");
		rewrite = rewrite.split(/order by/gi).join("<br /><b>ORDER BY</b>");
		
		// Set HTML on example rewrite
		var el = gel("example_query_rewrite");
		if (el) {
			el.innerHTML = rewrite;
			var msg = gel("example_rewrite_msg");
			if (msg) {
				msg.show();
			}
		}
	}

	/* Functions to support PG hints */



	// True if it's index hint for PG
	function _isPgIndexHint() {
		return g_form.tableName == 'sys_query_index_hint' && g_form.getValue('engine') == 'postgresql';
	}

	function _updateExamplePgIndexHint(query, replacement) {
			// Extract hint from replacement by removing group reference ' {$1}'
			var hint = replacement.replace(/\{\$1}$/, '');
		
			var rewrite = "<span style='font-weight:bold;background-color:yellow'>" + hint + "</span>" + query;
			showQueryRewrite(rewrite);
	}
}
