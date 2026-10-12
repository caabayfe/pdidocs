(function executeRule(current, previous) {
      
      var dashboardSysId = current.getValue('dashboard');
      var deletedBreakdownSrc = current.getValue('breakdown_source');
      var nextBreakdownSrc = '';
      var userPref = gs.getUser().getPreference('com.snc.pa.ui.preferences_dashboards');
      var parsedPref = this.parsePreferences(userPref);
      var gr = new GlideRecord('pa_m2m_dashboard_sources');
      gr.addQuery('dashboard', dashboardSysId);
      gr.orderBy('order');
      gr.query();
      nextBreakdownSrc = (gr.next() && parsedPref.last === dashboardSysId) ? gr.getValue('breakdown_source') : '';
      this.removeStaleData(parsedPref, dashboardSysId, deletedBreakdownSrc, nextBreakdownSrc);
      gs.getUser().savePreference('com.snc.pa.ui.preferences_dashboards', JSON.stringify(parsedPref));
      
      this.updateOtherUserPreferences(dashboardSysId, deletedBreakdownSrc, nextBreakdownSrc);
      
  })(current, previous);
  function parsePreferences(value) {
      var newValue = {};
      
      try {
          newValue = JSON.parse(value);
      } catch (err) {
          gs.warn('There is an issue with deleting user preferences when breakdown source was deleted.');
      }
      return newValue;
  }
  function removeStaleData(parsedPref, dashboardSysId, deletedBreakdownSrc, nextBreakdownSrc) {
      if (parsedPref[dashboardSysId] === deletedBreakdownSrc) {
          delete parsedPref[dashboardSysId];
          parsedPref[dashboardSysId] = nextBreakdownSrc;
      }
      
      delete parsedPref[dashboardSysId + '-' + deletedBreakdownSrc];
      delete parsedPref[dashboardSysId + '-' + deletedBreakdownSrc + '-sortorder'];
  }
  function updateOtherUserPreferences(dashboardSysId, deletedBreakdownSrc, nextBreakdownSrc) {
      var gr = new GlideRecord('sys_user_preference');
      gr.addQuery('name', 'com.snc.pa.ui.preferences_dashboards');
      gr.addQuery('value', 'CONTAINS', deletedBreakdownSrc);
      gr.query();
      
      while (gr.next()) {
          var parsedPref = this.parsePreferences(gr.getValue('value'));
          this.removeStaleData(parsedPref, dashboardSysId, deletedBreakdownSrc, nextBreakdownSrc);
          var userPrefString = JSON.stringify(parsedPref);
          gr.setValue('value', userPrefString);
          gr.update();
      }
  }
