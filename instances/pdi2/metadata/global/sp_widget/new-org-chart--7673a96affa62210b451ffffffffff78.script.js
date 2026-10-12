(function() {
  var PRIMARY_FIELDS = ['name', 'title'];
  var SECONDARY_FIELDS = [
    { f: 'department', i: 'sitemap' },
    { f: 'location', i: 'map-marker' },
    { f: 'email', i: 'envelope', t: 'email', tag: 'mailto:' },
    { f: 'mobile_phone', i: 'phone', t: 'phone', tag: 'tel:' }
  ];
  data.isError = false;
  data.errorMsg = "";
  data.userId = $sp.getParameter('sys_id') || $sp.getParameter('p') || gs.getUserID();
  data.hideSearch = $sp.getParameter('hide_search') || $sp.getParameter('sys_canvas') || options.hide_search;
  data.hideAction = options.hide_action == "true" || false;
  var windowSize = parseInt(options.max_report_to_show) || 12;
  data.hasMoreReport = false;
  data.directReportCount = 0;
  data.directReports = [];

  data.i18n = {
    searchMsg: gs.getMessage("Search for an employee"),
    noUserIdMsg: gs.getMessage("Please provide a valid User ID."),
    orgChartNotFound: gs.getMessage("No matching user found in the org chart."),
    loadDirectReports: gs.getMessage("Loading direct reports"),
    profilePictureLabel: gs.getMessage("Profile Picture of ")
  };

  function createCards() {
    //var r = {};
    var userGr = new GlideRecord('sys_user');
    userGr.get(data.userId);
    if (!userGr.canRead()) {
      return;
    }

    data.selectedUser = getUserData(userGr);
    if (!data.selectedUser.title) {
      data.isError = true;
      data.errorMsg = data.i18n.orgChartNotFound;
      return;
    }
    getRecordDisplayValues(userGr);
    data.directReports = getDirectReports(data.userId, 0);
    data.managerHierarchy = getManagerHierarchy(userGr);
  }

  var primaryFields = options && options.primary_fields && options.primary_fields.split(",").map(function(f) { return f.trim()});
  primaryFields = primaryFields.length <= 2 ? primaryFields : PRIMARY_FIELDS;

  var maxManagerLevel = options && options.max_manager_level || 7;

  var secondaryFieldOptions = options && options.secondary_fields && options.secondary_fields.split(",").map(function(f) { return f.trim() });
  options.profile_url = options.profile_url || '?id=user_profile&sys_id={sys_id}';

  if (secondaryFieldOptions && secondaryFieldOptions.length > 0) {
    data.secondaryFields = secondaryFieldOptions.map(function(s) {
      var d = s.split(':');
      if (d.length > 2) {
        var type = d[2].trim();
        var tag = d[3] ? d[3].trim() : null;
        if (!tag) {
          if (type === 'phone') {
            tag = 'tel:';
          } else if (type === 'email') {
            tag = 'mailto:';
          }
        }
        if (tag)
          return { f: d[0].trim(), i: d[1].trim(), t: d[2].trim(), tag: tag };
        else
          return { f: d[0].trim(), i: d[1].trim(), t: d[2].trim() };
      } else if (d.length > 1) {
        return { f: d[0].trim(), i: d[1].trim() };
      }
    });
  } else {
    data.secondaryFields = SECONDARY_FIELDS;
  }

  if (input && input.userId)
    data.userId = input.userId;

  if (input && input.action === "moreReport" && input.offset){
    data.directReports = getDirectReports(data.userId, input.offset || 0);
  } else if (data.userId) {
    createCards();
  } else {
    data.isError = true;
    data.errorMsg = data.i18n.noUserIdMsg;
  }

  function getDirectReports(userId, offSett) {
    var c = [];
    var gr = new GlideRecord('sys_user');
    gr.addActiveQuery();
    gr.addQuery('manager', userId);
    gr.orderBy("name");
    gr.chooseWindow(0, offSett + windowSize, true);
    gr.query();
    data.directReportCount = gr.getRowCount();
    while (gr.next())
      c.push(getUserData(gr));

    if (data.directReportCount > offSett + windowSize)
      data.hasMoreReport = true;

    return c;
  }

  function getManagerHierarchy(userGr) {
    var managers = [];
    var accounted = [];
    if (userGr.manager) {
      var managerID = userGr.getValue('manager');
      while (!gs.nil(managerID) && managers.length < maxManagerLevel) {
        //avoid cycle in hierarchy
        if (accounted.indexOf(managerID) >= 0)
          break;
        accounted.push(managerID);

        userGr = new GlideRecord('sys_user');
        if (!userGr.get(managerID) || !userGr.canRead())
          break;
        managerID = userGr.getValue('manager');
        managers.push(getUserData(userGr));
      }
    }
    return managers;
  }

  function getUserData(gr) {
    var u = {};
    if (gr.sys_id) {
      u.sys_id = gr.sys_id + '';
      u.reportCount = 0;
      if(primaryFields[0])
        u.title = gr.getElement(primaryFields[0]).canRead() ? gr.getDisplayValue(primaryFields[0]) || '' : '';
      if(primaryFields[1])
        u.description = gr.getElement(primaryFields[1]).canRead() ? gr.getDisplayValue(primaryFields[1]) || '' : '';

      var ga = new GlideAggregate('sys_user');
      ga.addQuery('manager', u.sys_id);
      ga.addQuery('active', true);
      ga.addAggregate('COUNT');
      ga.query();
      if (ga.next()) {
        u.reportCount = parseInt(ga.getAggregate('COUNT')) || 0;
      }

      if (u.reportCount == 1)
        u.reportCountTooltip = gs.getMessage("Total 1 report");
      else if (u.reportCount > 1)
        u.reportCountTooltip = gs.getMessage("Total {0} reports", [u.reportCount.toFixed(0)]);

      u.ariaLabel = [u.title, u.description, u.reportCountTooltip].filter(function(el) {
        return !gs.nil(el);
      }).join(", ");
    }
    return u;
  }

  function getRecordDisplayValues(gr) {
    if (data.secondaryFields.length === 0)
      return;

    var fieldList = data.secondaryFields;
    for (var i = 0; i < fieldList.length; i++) {
      var f = fieldList[i].f;
      if (f.length == 0)
        continue;
      var dv = gr.getDisplayValue(f);
      if (dv && dv.length > 0 && gr.getElement(f).canRead()) {
        data.selectedUser.hasSecondaryFields = true;
        data.selectedUser[f] = dv;
      } else
        data.selectedUser[f] = "";
    }
  }
})();
