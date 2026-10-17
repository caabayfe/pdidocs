function onSubmit() {
	var label = gel('label').value;
	var embeddedSnippet = gel('embedded-link').value;
	var param;
	var action;
	var url = extractUrl(embeddedSnippet);
	
	if(!isEmpty(label) && !isEmpty(url)) {
		
		param = {
			"label": label,
			"url": url
		};
		action = GlideDialogWindow.get().getPreference('action');
		action(param);
		
	} else 
		toggleError();
}

function toggleError() {
	document.getElementById('error-msg').style.visibility = 'visible';
}

function extractUrl(embeddedLink) {
	var dom = new DOMParser().parseFromString(embeddedLink, 'text/html');
	var iframe = dom.body.getElementsByTagName('iframe')[0];
	return !isEmpty(iframe) ? iframe.getAttribute('src') : null;
}

function isEmpty(item) {
	return item === "" || item === undefined || item === null;
}
