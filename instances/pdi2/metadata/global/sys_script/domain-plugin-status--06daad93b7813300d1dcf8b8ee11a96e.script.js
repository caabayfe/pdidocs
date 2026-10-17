(function executeRule(current, previous /*null when async*/) {
  g_scratchpad.DomainPluginActive = GlidePluginManager.isActive('com.glide.domain.msp_extensions.installer');
})(current, previous);
