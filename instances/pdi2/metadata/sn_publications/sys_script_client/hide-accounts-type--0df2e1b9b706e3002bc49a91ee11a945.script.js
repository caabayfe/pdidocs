function getParmVal(name){
	var url = document.URL.parseQuery();
	if (url[name]){
		return decodeURI(url[name]);
	}
}

function onLoad() {
	var target = getParmVal('sysparm_target');
	if (target == 'sn_publications_publication.recipient_lists') {
		g_form.removeOption('type', 'accounts');
	}
}
