answer = pageParams.route != 'configuration-landing-page' && gs.hasRole('sn_sow_itsm_admin.sow_admin_user') && gs.hasRole('notify_admin') && new GlidePluginManager().isActive('com.snc.notify');
