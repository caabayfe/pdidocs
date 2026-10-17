var glideRecord = new GlideRecord("sys_search_context_config");
  glideRecord.addQuery("search_engine", "ai_search");
  glideRecord.query();
  while (glideRecord.next()) {
    glideRecord.enable_exact_match = true;
    glideRecord.update();
  }
