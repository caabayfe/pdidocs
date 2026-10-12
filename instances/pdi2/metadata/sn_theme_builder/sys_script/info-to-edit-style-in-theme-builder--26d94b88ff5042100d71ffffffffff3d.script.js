(function executeRule(current, previous /*null when async*/ ) {
    var styleRecordType = ThemeRepository.getStyleRecordType(current.sys_id);
    var themeId = ThemeRepository.getThemeIdForStyleRecord(current.sys_id);
    var themeBuilderLink;
    var infoMessage;
    switch (styleRecordType) {
        case Constants.STYLE_VARIANT_TYPE:
            themeBuilderLink = '<a target="_blank" href="now/theme-builder/edit-colors/' + themeId + '/params/variant-id/' + current.sys_id + '">Theme Builder</a>';
            break;
        case Constants.IMAGERY_STYLE_TYPE:
            themeBuilderLink = '<a target="_blank" href="now/theme-builder/edit-imagery/' + themeId + '">Theme Builder</a>';
            break;
        case Constants.TYPOGRAPHY_STYLE_TYPE:
            themeBuilderLink = '<a target="_blank" href="now/theme-builder/edit-typography/' + themeId + '">Theme Builder</a>';
            break;
        case Constants.COLORS_STYLE_TYPE:
            themeBuilderLink = '<a target="_blank" href="now/theme-builder/edit-colors/' + themeId + '">Theme Builder</a>';
            break;
        case Constants.SHAPE_STYLE_TYPE:
            themeBuilderLink = '<a target="_blank" href="now/theme-builder/edit-shape/' + themeId + '">Theme Builder</a>';
            break;
        default:
            break;
    }
    if (styleRecordType === Constants.COLORS_STYLE_TYPE || styleRecordType === Constants.STYLE_VARIANT_TYPE) {
		infoMessage = gs.getMessage('The color record should be in RGB format. Update your theme colors with {0} for the best experience.', themeBuilderLink);

    } else {
        infoMessage = gs.getMessage('Update your theme with {0} for the best experience.', themeBuilderLink);
	}
    gs.addInfoMessage(infoMessage);

})(current, previous);
