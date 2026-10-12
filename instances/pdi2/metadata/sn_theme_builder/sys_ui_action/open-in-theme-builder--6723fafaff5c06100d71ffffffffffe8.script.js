function openThemeBuilder() {
    var ga = new GlideAjax('ClientThemeRepository');
    ga.addParam('sysparm_name', 'getThemeDetailsForStyleRecord');
    ga.addParam('sysparm_styleId', g_form.getUniqueValue());
    ga.getXMLAnswer(ResponseFunction);
}

function ResponseFunction(response) {
    try {
        var styleRecordName = g_form.getValue('name');
        var styleRecordType = g_form.getValue('type');
        var themeId = JSON.parse(response).themeId;
        var themeBuilderLinkPrefix = 'now/theme-builder/';
        var themeBuilderLink;
        if (styleRecordType === 'variant') {
            themeBuilderLink = themeBuilderLinkPrefix + 'edit-colors/' + themeId + '/params/variant-id/' + g_form.getUniqueValue();
        } else {
            switch (styleRecordName) {
                case 'Imagery':
                    themeBuilderLink = themeBuilderLinkPrefix + 'edit-imagery/' + themeId;
                    break;
                case 'Typography':
                    themeBuilderLink = themeBuilderLinkPrefix + 'edit-typography/' + themeId;
                    break;
                case 'Colors':
                    themeBuilderLink = themeBuilderLinkPrefix + 'edit-colors/' + themeId;
                    break;
                case 'Shape and Form':
                    themeBuilderLink = themeBuilderLinkPrefix + 'edit-shape/' + themeId;
                    break;
                default:
                    break;
            }
        }
        g_navigation.openPopup(themeBuilderLink);
    } catch (e) {
        g_form.addErrorMessage(e.toString());
    }

}
