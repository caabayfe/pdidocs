(function executeRule(current, previous /*null when async*/) {
    function withinBounds(value, min, max) {
      var intValue = parseInt(value);
      if (isNaN(intValue))
          return false;
      return intValue >= min && intValue <= max;
    }
    var fieldsWithErrors = [];

    if (!withinBounds(current.recent_items_count, 0, 15)) {
      fieldsWithErrors.push(gs.getMessage('Recent items count (range: {0} to {1})', [0, 15]));
    }

    if (!withinBounds(current.recent_terms_count, 0, 15)) {
      fieldsWithErrors.push(gs.getMessage('Recent terms count (range: {0} to {1})', [0, 15]));
    }

    if (!withinBounds(current.tab_drilldown_items_per_page, 5, 100)) {
      fieldsWithErrors.push(gs.getMessage('Tab drilldown items per page (range: {0} to {1})', [5, 100]));
    }

    if (!withinBounds(current.tab_overview_items_per_section, 5, 100)) {
      fieldsWithErrors.push(gs.getMessage('Tab overview items per page (range: {0} to {1})', [5, 100]));
    }

    if (fieldsWithErrors.length > 0) {
      gs.addErrorMessage(gs.getMessage('Invalid values detected for fields: ') + fieldsWithErrors.join(', '));
      current.setAbortAction(true);
    }
})(current, previous);
