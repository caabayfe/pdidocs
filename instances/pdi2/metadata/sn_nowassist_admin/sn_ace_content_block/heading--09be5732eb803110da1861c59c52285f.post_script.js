(function(context, pageParams, blockcontext, dataParams) {
    // write code here

    var themeableImageAvailable = NAAPluginUtil.isThemeableBannerAvailable();
    if (themeableImageAvailable.flag) { //check if themeable banner is available or not
        context.style = {
            "color": "RGB(var(--now-color_text--primary))",
            "font-family": 'Cabin',
            "font-style": "normal",
            "font-weight": "700",
            "font-size": "32px",
        };
    } else {
        context.style = {
            "color": "RGB(var(--now-color--neutral-0))",
            "font-family": 'Cabin',
            "font-style": "normal",
            "font-weight": "700",
            "font-size": "32px",
        };
    }
})(context, pageParams, blockcontext, dataParams);
