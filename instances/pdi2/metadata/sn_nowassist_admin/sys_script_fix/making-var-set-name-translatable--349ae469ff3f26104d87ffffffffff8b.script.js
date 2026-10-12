(function() {
	try {
    var naaGlobalUtil = new global.NowAssistAdminGlobalScopedUtil();
    var updateColumn = naaGlobalUtil.updateColumn.bind(naaGlobalUtil);
    updateColumn('sn_nowassist_skill_config_var_set', 'name', 'internal_type', 'translated_text');
    updateColumn('sn_ns_skill_config_var_set_ui', 'name', 'internal_type', 'translated_text');
  } catch (e) {
      gs.error("Updating record failed in fix Script: " + e.toString());
      return null;
  }
})();
