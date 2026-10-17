(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var appManagerApiUtil = new AppManagerApiUtil(request, response);
    var handler = new AppManagerHandler();
    try {
        var payload = appManagerApiUtil.getRequestBody();
        var type = Constants.PRODUCT;
        var installation_plan = payload;
        if(payload.type) {
          installation_plan = payload.install_plan;
          type = payload.type;
        }
        verifyProductAccess(installation_plan, appManagerApiUtil);
        var result = handler.installProduct(installation_plan, type);
        appManagerApiUtil.setResponseBody(result);
    } catch (err) {
        appManagerApiUtil.setError(err);
    }

    function verifyProductAccess(payload, appManagerApiUtil) {
      var isCompanyInstaller = gs.hasRole('sn_appclient.app_client_company_installer') &&
        !gs.hasRole('sn_appclient.app_client_user') &&
        !gs.hasRole('admin') &&
        !gs.hasRole('maint');
      if (isCompanyInstaller) {
            throw new Error("Access denied: app_client_company_installer role cannot perform product installations.");
      }
      var packages = payload.packages || [];
      var hasApp = false;
      var hasPlugin = false;
      for (var i = 0; i < packages.length; i++) {
          var pkg = packages[i];
          if (pkg.type === 'application') {
              hasApp = true;
          }
          if (pkg.type === 'plugin' || pkg.is_plugin === true) {
              hasPlugin = true;
          }
          if (hasApp && hasPlugin) {
              break;
          }
      }

      var tables = [];
      if (hasApp) tables.push("sys_store_app", "sys_remote_app");
      if (hasPlugin) tables.push("v_plugin");

      if (tables.length > 0) {
          appManagerApiUtil.verifyTablesReadAccess(tables);
      }
    }
})(request, response);
