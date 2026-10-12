
(function(context, pageParams, blockcontext){
	var languageForTranslation = blockcontext.languageForTranslation;
	var languageForTranslationLabel = blockcontext.languageForTranslationLabel;
	var translationOptions = new global.NLUTranslateUtil.getTranslationOptions([languageForTranslation]);
	var translationOptionsLength = translationOptions.length;
	var useAIInteraction =  (translationOptionsLength && translationOptions[0].machineTranslate) ? 'select' : 'none'; 
	var useThirPartyInteraction = (translationOptionsLength && translationOptions[0].thirdPartyTranslate) ? 'select' : 'none';

	var thirdPartyTranslate = translationOptionsLength ? translationOptions[0].thirdPartyTranslate : false;
	var machineTranslate = translationOptionsLength ? translationOptions[0].machineTranslate : false;
	var exportImport = translationOptionsLength ? translationOptions[0].exportImport : false;

	var modeNotAvlbText = 'Not available for ' + languageForTranslationLabel;

	var noTraslationSelected = blockcontext.noTraslationSelected;
	var modeOfTranslation = blockcontext.modeOfTranslation;
	var thirdPartyTranslateSelected = blockcontext.thirdPartyTranslateSelected;
	var machineTranslateSelected = blockcontext.machineTranslateSelected

	if((thirdPartyTranslateSelected && !thirdPartyTranslate) || machineTranslateSelected && !machineTranslate) {
		noTraslationSelected = true;
		modeOfTranslation = 'manual';
	}

	

	return {
		useAIInteraction: useAIInteraction,
		useThirPartyInteraction: useThirPartyInteraction,
		thirdPartyTranslate: thirdPartyTranslate,
		machineTranslate: machineTranslate,
		exportImport: exportImport,
		modeNotAvlbText: modeNotAvlbText,
		showTextForAIMode: machineTranslate === false,
		showTextForThirdPartyMode: thirdPartyTranslate === false,
		noTraslationSelected: noTraslationSelected,
		modeOfTranslation: modeOfTranslation
	};
	// translationOptions: [{"code":"de","thirdPartyTranslate":true,"machineTranslate":true,"exportImport":true}]
})(context, pageParams, blockcontext);
