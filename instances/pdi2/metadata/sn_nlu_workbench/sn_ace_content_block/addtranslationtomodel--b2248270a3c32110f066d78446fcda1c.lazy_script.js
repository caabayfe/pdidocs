(function(context, pageParams, blockcontext) {
    var modeOfTranslation = blockcontext.modeOfTranslation;
    var languageForTranslation = blockcontext.languageForTranslation;
    var modelForTranslation = blockcontext.modelForTranslation;
    var translator = new global.NLUModelTranslator(modelForTranslation, languageForTranslation);
    var response = translator.translate(modeOfTranslation);
	return response;
})(context, pageParams, blockcontext);
