(function executeRule(current, previous) {
  try {
    if (!current.matching_now_experience_theme.changes()) {
      return;
    }

    var themeId = current.getUniqueValue();
    if (!themeId) {
      return;
    }

    var mappings = new GlideRecord('m2m_sp_theme_sp_theme_variant');
    mappings.addQuery('theme', themeId);
    mappings.addNotNullQuery('matching_now_experience_theme_variant');
    mappings.addQuery('active', true);
    mappings.query();

    var count = 0;
    while (mappings.next()) {
      mappings.setValue('active', false);
      if (mappings.update()) {
        count++;
      }
    }

    if (count > 0) {
      var infoMessage = sn_i18n.Message.getMessage('service_portal.theme_variants',
        'Deactivated {count} theme variant mapping(s) because the matching Next Experience theme changed for "{themeName}".',
        {
          count: String(count),
          themeName: current.getDisplayValue()
        }
      );
      gs.addInfoMessage(infoMessage);
    }

  } catch (e) {
    gs.error('Error in "Inactivate mappings on UXF theme change" BR: theme=' + current.getUniqueValue() + ' name="' + current.getDisplayValue() + '" error=' + e.message);
  }
})(current, previous);
