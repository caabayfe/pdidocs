function onLoad() {
	var sections = g_form.getSections();
	for( var i=0; i<sections.length; i++ ){
		if( !sections[i].textContent.startsWith("Options") )
			continue;

		// state is not closed
		if( (sections[i].className).indexOf('state-closed') != -1 )
			continue;

		hideReveal(sections[i].id.substr('section-'.length), false, true);
	}
}
