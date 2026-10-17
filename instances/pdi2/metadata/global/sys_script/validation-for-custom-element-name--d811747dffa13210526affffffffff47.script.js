(function executeRule(current, previous /* null when async */) {
    const name = (current.id || '').trim();
	const reservedNames = new Set([
		'annotation-xml', 'color-profile', 'font-face', 'font-face-src',
		'font-face-uri', 'font-face-format', 'font-face-name', 'missing-glyph'
	]);

	if (!name || !name.includes('-') || (!/^[a-z]/.test(name)) || (name.toLowerCase().startsWith('xml'))
		|| (!/^[a-z0-9._-]+$/.test(name)) || (/[A-Z]/.test(name)) || (reservedNames.has(name))) {
		gs.addErrorMessage(gs.getMessage(`Invalid custom element name "${name}"`));
		current.setAbortAction(true);
		return;
	}
	current.id = name;
})(current, previous);
