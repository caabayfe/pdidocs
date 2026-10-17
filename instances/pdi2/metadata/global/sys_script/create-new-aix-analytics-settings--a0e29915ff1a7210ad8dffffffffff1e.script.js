(function executeRule(current, previous) {

  var mgr = new AIXExperienceAnalyticsManager();

  // ---------- INSERT ----------
  if (current.operation() === 'insert') {
    mgr.createAnalyticsApp(current);
    return;
  }

  // ---------- UPDATE (title change only) ----------
  if (current.operation() === 'update' && current.title.changes()) {
    mgr.updateAnalyticsAppName(current);
  }

})(current, previous);
