function transform(input) { 
    var result = {appRoute: '', pageName: '', pagePath: ''};
    
    var aceAppConfigGr = new GlideRecord('sn_ace_app_config');
    var uxPageRegistryGr = new GlideRecord('sys_ux_page_registry');
    if (input.appConfigId && aceAppConfigGr.get(input.appConfigId)) {
      uxPageRegistryGr.addQuery('admin_panel', aceAppConfigGr.getValue('app_config'));
      uxPageRegistryGr.query();
      if (uxPageRegistryGr.next())
      result.appRoute = uxPageRegistryGr.getValue('path');
    }
    
    var acePageGr = new GlideRecord('sn_ace_page');
    var uxRouteGr = new GlideRecord('sys_ux_app_route');
    if (input.pageId && acePageGr.get(input.pageId)) {
      result.pageName = acePageGr.getValue('name');
      if (uxRouteGr.get(acePageGr.getValue('route')))
      result.pagePath = uxRouteGr.getValue('route_type');
    }
    
    return result;
} 
