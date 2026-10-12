(function process(env) {
  var sysId = env.getArguments().sysId;

  var DEFAULT_LOOKUP = {
    chrome_header: {
      privatePage: {
        userPrefsEnabled: false,
        searchEnabled: false,
        currentScreenLinkConfiguration: {},
        globalTools:  {
          collapsingMenuId: 0,
          primaryItems: [],
          secondaryItems: [],
        },
      },
      publicPage: {
        menuEnabled: false,
        searchEnabled: false,
        logoRoute: {},
        actionButtons: [],
      },
    },
    chrome_menu: [],
    chrome_footer: {
      public_page: {
        enable_footer_topbar: false,
        footer_topbar_options: {},
        enable_footer_bar: false,
        footer_bar_options: {},
      },
    },
  };
  function getOrCreatePagePropertyRecord(id, name, defaultValue) {
    var gr = new GlideRecord("sys_ux_page_property");

    var pageRecord = new GlideRecordSecure("sys_ux_page_registry");
    pageRecord.addQuery("sys_id", id);
    pageRecord.query();
    
    if (!pageRecord.next()) {
      return false;
    }

    gr.addQuery("name", name);
    gr.addQuery("page", id);
    gr.addNullQuery("route");
    gr.query();
    if (gr.next()) {
      return gr;
    } else if (pageRecord.getValue("sys_scope") !== gr.getValue("sys_scope")) {
      gr.newRecord();
      gr.setValue("value", JSON.stringify(defaultValue));
      gr.setValue("page", id);
      gr.setValue("name", name);
      gr.setValue("type", "json");
      gr.insert();
      
      return gr;
    }
  }

  var header = getOrCreatePagePropertyRecord(
    sysId,
    "chrome_header",
    DEFAULT_LOOKUP["chrome_header"]
  );
  var headerSettings = JSON.parse(header.getValue("value"));
  var menu = getOrCreatePagePropertyRecord(
    sysId,
    "chrome_menu",
    DEFAULT_LOOKUP["chrome_menu"]
  );
  var footer = getOrCreatePagePropertyRecord(
    sysId,
    "chrome_footer",
    DEFAULT_LOOKUP["chrome_footer"]
  );
  var footerSettings = JSON.parse(footer.getValue("value"));

  return {
    headerSysId: header.getValue("sys_id"),
    menu: headerSettings.publicPage.menuEnabled,
    menuSysId: menu.getValue("sys_id"),
    footerTop: footerSettings.public_page.enable_footer_topbar,
    footerBottom: footerSettings.public_page.enable_footer_bar,
    footerSysId: footer.getValue("sys_id"),
  };
})(env);
