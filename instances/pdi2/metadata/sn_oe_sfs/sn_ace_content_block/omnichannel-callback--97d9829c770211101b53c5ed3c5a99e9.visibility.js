answer = GlidePluginManager.isActive('com.sn.omnichannel.callback') && (gs.getUser().hasRole('sn_omni_callback.callback_api') || gs.getUser().hasRole('virtual_agent_admin'));
