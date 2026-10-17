//Grant access to users that have at least one role
answer = gs.getProperty('glide.cms.enable.responsive_grid_layout', 'true') === 'true' && gs.getUser().hasRoles() && gs.getProperty('com.snc.par.coreui.dashboard_create.enabled', 'false') === 'true';
