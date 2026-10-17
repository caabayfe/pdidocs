(function(context, pageParams, blockcontext) {
    // source image
    var src = '';
    // default css for polaris fallback image
    var css = {
        "background-color": "rgb(var(--now-color_background--secondary))",
        "min-height": "160px",
        "padding": "2.5rem 3rem",
        "background-size": "cover",
        "background-image": "url('/images/now_assist_landing_page_banner.png')",
        "display": "grid"

    };
    var themeableImageAvailable = NAAPluginUtil.isThemeableBannerAvailable();
    if (themeableImageAvailable.flag) { //check if themeable banner is available or not
        src = themeableImageAvailable.name;
        css = {
            "background": "linear-gradient(90deg, rgba(var(--now-color--interactive-0, 189, 222, 231, 1)) 0%, rgba(var(--now-color_selection--primary-0, 224, 234, 222, 1)) 100%)",
            "display": "grid",
            "padding": "2.5rem 3rem",
            "min-height": "160px"
        };
    }

    return {
        bannerImageSrc: src,
        bannerImageCss: css

    };

})(context, pageParams, blockcontext);
