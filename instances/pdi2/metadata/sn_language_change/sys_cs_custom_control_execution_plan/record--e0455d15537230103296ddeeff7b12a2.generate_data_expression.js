function() {
    var language = 'English';
    var languageGR = new GlideRecord('sys_language');
    if (languageGR.isValid()) {
      languageGR.addQuery('id', vaVars.global_runtime_detected_language);
      languageGR.query();
    
      if(languageGR.next()) {
        language = languageGR.getValue('name');
      }
    }

    var detectedLanguageCode = vaVars.global_runtime_detected_language;
    var requesterLanguage = gs.getMessageLang(language, vaContext.getRequesterLang());
    var translatedLanguage = gs.getMessageLang(language, detectedLanguageCode);

    return {	
        "label": gs.getMessageLang('I have detected you are typing in {0}. Would you like to continue the conversation in {0}?', vaContext.getRequesterLang(), requesterLanguage),
        "translatedLabel": gs.getMessageLang('I have detected you are typing in {0}. Would you like to continue the conversation in {0}?', detectedLanguageCode, translatedLanguage),
        "languageCode": detectedLanguageCode,
        "defaultYes": gs.getMessageLang('Yes', vaContext.getRequesterLang()),
        'defaultNo' : gs.getMessageLang('No', vaContext.getRequesterLang()),
        "translatedYes": gs.getMessageLang('Yes', detectedLanguageCode),
        "translatedNo": gs.getMessageLang('No', detectedLanguageCode)
    };
}
