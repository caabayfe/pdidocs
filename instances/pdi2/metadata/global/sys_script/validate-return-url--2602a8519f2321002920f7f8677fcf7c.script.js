if (current.url != '' && !(current.url.charAt(0) == '.' && current.url.charAt(1) == '/') && current.url.charAt(0) != '/') {
	gs.addErrorMessage(gs.getMessage('This URL must be in the same domain as the instance and must be preceded by a ./ or a /.'));
    current.url.setError('This URL must be in the same domain as the instance and must be preceded by a ./ or a /.');
    current.setAbortAction(true);
}
