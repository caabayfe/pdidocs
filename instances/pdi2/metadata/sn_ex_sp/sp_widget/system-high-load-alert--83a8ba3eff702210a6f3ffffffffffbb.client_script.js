api.controller = function() {
    /* widget controller */
    var c = this;
    c.bannerClass = 'banner-' + c.data.bannerType;

    var iconClasses = {
        'warning': 'fa fa-exclamation-triangle',
        'error': 'fa fa-exclamation-circle',
        'info': 'fa fa-info-circle'
    };
    c.bannerIconClass = iconClasses[c.data.bannerType] || '';
    c.dismissBanner = function() {
        c.data.showBanner = false;
    };
};
