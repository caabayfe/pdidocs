(function () {
  /* populate the 'data' object */
  /* e.g., data.table = gs.getValue('table'); */
  var portalRecord = $sp.getPortalRecord();
  data.title = options.inputTitle || '';
  data.searchMsg = options.placeholder || gs.getMessage('Search for content');
  data.searchMsgMobile = gs.getMessage("Search");
  data.searchMsgBtn = options.btnTitle || gs.getMessage('Search button');
  data.configId = options.searchConfigId || portalRecord.getValue('search_application');
  data.isMobileApp = options.isMobileApp;
  data.searchLandmark = !data.isMobileApp ? gs.getMessage('Search resources') : "";
  data.recentSearches = gs.getMessage('Recent Searches');
  data.isLocationTrackerDisabled = (gs.getProperty('glide.service_portal.disable_location_tracker') == "true") || false;
  data.OPTION_TYPES = {
    'USER_HISTORY': gs.getMessage('Recent searches')
  };
  data.suggestedResults = gs.getMessage('Suggested results');
  data.isWashington = false;
  var familyVersion = gs.getProperty("glide.buildname");
  if (familyVersion.startsWith('Washington') || familyVersion.startsWith('washington')) {
      data.isWashington = true;
  }
  data.EVENTS = new sn_ex_sp.ContentSearchUtils().getInstanceEvents(options.parentWidgetInstance);

  return data;

})();
