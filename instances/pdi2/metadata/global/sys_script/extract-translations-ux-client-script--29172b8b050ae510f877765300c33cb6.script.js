(function executeRule(current, previous /*null when async*/ ) {

    var translations = new CreateUXTranslations().getRequiredTranslations(current.script, current.type);
    current.required_translations = JSON.stringify(translations, null, 4);
})(current, previous);
    
