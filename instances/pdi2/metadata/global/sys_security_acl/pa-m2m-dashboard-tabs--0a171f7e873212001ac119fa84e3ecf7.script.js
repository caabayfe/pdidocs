answer = gs.getProperty('glide.cms.enable.responsive_grid_layout', 'true') === 'true' &&
    gs.getUser().hasRoles() &&
    new PADashboardACLUtils().userCanWriteDashboard(current.getValue('dashboard'));
