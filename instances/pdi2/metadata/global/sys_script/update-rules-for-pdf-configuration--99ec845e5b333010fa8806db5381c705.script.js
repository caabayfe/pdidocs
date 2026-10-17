(function executeRule(current, previous /*null when async*/ ) {

    var chineseFontsProperty = 'com.snc.pdf.chinese_fonts.enabled';
    var japaneseFontsProperty = 'com.snc.pdf.japanese_fonts.enabled';
    var koreanFontsProperty = 'com.snc.pdf.korean_fonts.enabled';
    var cachingFontsProperty = 'com.snc.pdf.caching_fonts.enabled';
	var pdfGenV2Property = 'com.snc.pdf.generation.v2.enabled';

    var prevN = previous.name;
    var prevV = previous.value;
    var currN = current.name;
    var currV = current.value;

    function hasPropertyChangedFromTrueToFalse(propertyName, prevValue, currValue) {

        if (propertyName == chineseFontsProperty || propertyName == japaneseFontsProperty ||
            propertyName == koreanFontsProperty) {
            if (prevValue == 'true' && currValue == 'false')
                return true;
        }
        return false;
    }

    function hasPropertyChangedFromFalseToTrue(propertyName, prevValue, currValue) {

        if (propertyName == chineseFontsProperty || propertyName == japaneseFontsProperty ||
            propertyName == koreanFontsProperty) {
            if (prevValue == 'false' && currValue == 'true')
                return true;
        }
        return false;
    }

    // if the font cache is disabled, then we are clearing the fonts from the memory and explicitly 
    // disabling the C,J, K fonts.
    if (prevN == cachingFontsProperty && currN == cachingFontsProperty &&
        prevV == 'true' && currV == 'false') {
		gs.info("As the font cache is disabled, unloading the Chinese, Japanese and Korean fonts from FontCache if any exists.");
        sn_pdfgeneratorutils.PDFGenerationAPI.cleanUpPdfResources();

        gs.setProperty(chineseFontsProperty, 'false');
        gs.setProperty(japaneseFontsProperty, 'false');
        gs.setProperty(koreanFontsProperty, 'false');
    }

    if (hasPropertyChangedFromTrueToFalse(prevN, prevV, currV)) {
		sn_pdfgeneratorutils.PDFGenerationAPI.cleanUpPdfResources();
		gs.setProperty(pdfGenV2Property, 'true');
	}
    

    if (hasPropertyChangedFromFalseToTrue(prevN, prevV, currV)) {
		gs.warn("As one or any or all of the Chinese or Japanese or Korean fonts are enabled, explicitly enabling the font cache.");
        gs.setProperty(cachingFontsProperty, 'true');
    }

})(current, previous);
