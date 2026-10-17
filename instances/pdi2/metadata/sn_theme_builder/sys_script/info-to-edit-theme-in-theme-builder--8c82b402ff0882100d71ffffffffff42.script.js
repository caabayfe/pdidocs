(function executeRule(current, previous /*null when async*/ ) {
    var themeBuilderLink = '<a target="_blank" href="now/theme-builder/edit-overview/' + current.sys_id + '">Theme Builder</a>';
    var infoMessage = gs.getMessage('Update your theme with {0} for the best experience.', themeBuilderLink);
    gs.addInfoMessage(infoMessage);
})(current, previous);
