(function() {
    data.isNodeUnderHeavyLoad = new sn_ex_emp_fd.PortalPerformanceUtil().getNodeStatus();
    data.bannerText = gs.getMessage(options.widget_title) || gs.getMessage("Some information may be temporarily unavailable as we're experiencing heavy usage. Try again later.");
    data.showBanner = options.visibility === 'true';
    data.showCloseIcon = options.show_dismiss_icon === 'true';
    data.bannerType = options.message_type || 'warning';
})();
