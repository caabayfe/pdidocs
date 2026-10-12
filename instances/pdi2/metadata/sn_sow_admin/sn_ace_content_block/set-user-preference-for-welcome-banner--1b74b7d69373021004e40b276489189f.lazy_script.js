(function(context, pageParams, blockcontext) {
    // return some_output
    gs.getUser().savePreference(blockcontext.welcomeBannerUserPreference, false);
    return {
        showWelcomeBannerContainer: false
    };
})(context, pageParams, blockcontext);
