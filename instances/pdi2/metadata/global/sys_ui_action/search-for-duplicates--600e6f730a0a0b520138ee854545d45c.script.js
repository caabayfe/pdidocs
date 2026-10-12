function openSearch(shortDescription) {
	url = "knowledge_home_launcher.do?sysparm_stack=no&query=" + encodeURIComponent(shortDescription);
	window.open(url, '_blank');
}
