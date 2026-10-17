redirect();

function redirect() {
	var sectionId = document.getElementById('section_id').innerHTML;
	var url = new GlideURL('slushbucket.do');
	url.addParam('sysparm_referring_url', '$[sysparm_table].do');
	url.addParam('sysparm_form', 'section');
	url.addParam('sysparm_list', sectionId);
	window.location = url.getURL();
}
