(function executeRule(current, previous /*null when async*/ ) {

    var langId = current.id;
	deactivateLanguageChoice(langId);
	removeAsFallback(langId);

    function deactivateLanguageChoice(langId) {
        var choice = new GlideRecord('sys_choice');
        choice.addQuery('name', 'sys_user');
        choice.addQuery('element', 'preferred_language');
        choice.addQuery('value', langId);
        choice.query();
        while (choice.next()) {
            choice.inactive = true;
            choice.update();
        }
    }

    function removeAsFallback(langId) {
        var language = new GlideRecord('sys_language');
        language.addQuery('fallback.id', langId);
        language.query();
        while (language.next()) {
            language.fallback = '';
            language.update();
        }
    }
})(current, previous);
