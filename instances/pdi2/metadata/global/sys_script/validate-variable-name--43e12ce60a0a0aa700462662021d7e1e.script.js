(function executeRule(current, previous /*null when async*/ ) {
	if (shouldSkipExecution(current))
		return;

    gs.include('validators');
    var rc = validateName();
    if (!rc) {
        current.setAbortAction(true);
        var errMsg = gs.getMessage("Variable names can only contain alphabets, numbers and the '_'characters. They must begin with an alphabet.");
        current.name.setError(errMsg);
    }

    function validateName() {
        var name = current.name + '';
        if (name == '')
            return true;

        var c = name.charAt(0);
        // first character has to be a letter
        var legal = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var isText = containsOnlyChars(legal, c);
        if (isText == false)
            return false;
        // all subsequent characters must be letters as well
        var legal = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_0123456789';
        var isText = containsOnlyChars(legal, name);
        return isText;
    }
	function shouldSkipExecution(current) {
		return shouldSkipByProcess(current) || !(current.name.changes());
	}
	function shouldSkipByProcess(current) {
		return JSUtil.has(new global.SNCCatalogUtil().isProcessBuilder) && new global.SNCCatalogUtil().isProcessBuilder(current, ['checkout']);
	}
})(current, previous);
