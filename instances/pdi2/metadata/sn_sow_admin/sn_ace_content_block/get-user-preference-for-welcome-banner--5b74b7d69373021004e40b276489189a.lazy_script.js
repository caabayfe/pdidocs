(function(context, pageParams, blockcontext) {
    // return some_output
    var showWelcomeBannerContainer = false;

    var userPrefGR = new GlideRecord('sys_user_preference');
    userPrefGR.addQuery('user', gs.getUserID());
    userPrefGR.addQuery('name', blockcontext.welcomeBannerUserPreference);
    userPrefGR.query();
    if (userPrefGR.next()) {
        showWelcomeBannerContainer = userPrefGR.getValue('value') == 'true';
    } else {
        showWelcomeBannerContainer = true;
    }
    return {
        showWelcomeBannerContainer: showWelcomeBannerContainer
    };
})(context, pageParams, blockcontext);
