function generateSearchSourcesFromTS() {
    var polarisSearch = new GlideRecord('m2m_search_context_config_search_source');

    var searchRecord = new GlideRecord('sys_search_source');
    var globalSourceGroup = new GlideRecord('ts_group');
    var globalSource = new GlideRecord('ts_table');

    globalSource.query();

    while (globalSource.next()) {
        searchRecord.initialize();

        var label = globalSource.group.name;
        //Remove '& Places' from name
        if (label.equals('People & Places')) {
            label = label.split('&')[0].trim();
        }
        label += ' - ' + GlideMetaData.getTablePlural(globalSource.name);
        searchRecord.setValue('name', label);
        searchRecord.setValue('source_table', globalSource.name);
        searchRecord.setValue('active', globalSource.active);
        searchRecord.setValue('condition', globalSource.condition);

        // Carry over the roles and groups on the parent ts_group to the new search source
        if (globalSourceGroup.get(globalSource.group)) {
            searchRecord.setValue('roles', globalSourceGroup.getValue('roles'));
            searchRecord.setValue('group', globalSourceGroup.getValue('group'));
        }

        var sysID = searchRecord.insert();

        polarisSearch.initialize();
        polarisSearch.setValue('search_context_config', 'c861cea2c7022010099a308dc7c26041');
        polarisSearch.setValue('source', sysID);
        polarisSearch.setValue("order", globalSource.order + (globalSource.group.order * 2));
        polarisSearch.insert();
    }
}

var i18nActive = pm.isActive("com.glide.i18n");
if (i18nActive) {
  var langUtils = new global.I18nUtils();
  var currentLanguage = langUtils.getLanguage();
  // Force English Only Translations
  langUtils.setLanguage("en");

  try {
      generateSearchSourcesFromTS();
  } finally {
      langUtils.setLanguage(currentLanguage);
  }
} else {
  generateSearchSourcesFromTS();
}
