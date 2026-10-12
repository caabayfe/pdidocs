// Used to determine if a route is a record or list route, does it have atleast 1
// screen in its screen collection that uses this record or list Macroponents
var recordMacroponentSysId = "558adc930f0210107d20409dc4767e84";
var listMacroponentSysId = "2c08111d0fc21010036a83fa68767ef6";

var breadCrumAppShellSysId = "e341e22cc32e2010ea04a5a1d840dd02";
var agentWorkspaceApshellSysId = "c276387cc331101080d6d3658940ddd2";

// Get all routes (sys_ux_app_route) from an Admin Panel (PageConfigSysId)
// check if any of its routes has a screen collection that contains at least 1
// screen that has a page Definition matching ScreenID. If so, return that route.
function checkRoutesForScreenID (PageConfigSysId, ScreenID){
  var routes = new GlideRecord('sys_ux_app_route');
  routes.addQuery('app_config', PageConfigSysId);

  routes.query();
  while(routes.next()){
    var screenCollection = routes.getValue('screen_type');

    var hasScreenId = new global.GlideQuery('sys_ux_screen')
    .where('screen_type', screenCollection)
    .where('screen_type', '!=', null)
    .where('macroponent', ScreenID)
    .count();   

    if (hasScreenId > 0) {
      // gs.info('At least 1 screen in the screen Collection has a macroponet (a.k.a. Page Definition) with the Screen ID' + ScreenID + " " + routes.getValue('name'));
      return routes;
    }
  }
}


// Based on an Experience's Admin Panel (PageConfigSysId), find all routes that
// belong to the admin panel and have a parent_macroponent_composition_element_id
// equal to 'wsInboxSidebar'.  This last query condition is required for a route
// to be the Inbox route.  If we get a result we know we have the Inbox Route
function checkInbox (PageConfigSysId){
  var Routes = new GlideRecord('sys_ux_app_route');
  Routes.addQuery('app_config', PageConfigSysId);
  Routes.addQuery('parent_macroponent_composition_element_id', 'wsInboxSidebar');
  
  Routes.query();
  while(Routes.next()){
    return Routes;
  }
}


// look for any sys_ux_page_registry (experiences) has has either `AgentWorkspaceApshell`
// or 'BreadcrumAppshell`as its root_macroponet.
// For all of these experiences, check to see if any of them contain a sys_ux_page_property
// with a name of "featureRoutes". If an experience doesn't have "featureRoutes",
// then store these experiences so that we can process their routes and generate
// a page property for featureRoutes
function findExperiencesForMacroponents () {
  var experiences = new GlideRecord('sys_ux_page_registry'); 
  var qc = experiences.addQuery('root_macroponent', agentWorkspaceApshellSysId);
  qc.addOrCondition('root_macroponent', breadCrumAppShellSysId);
  experiences.query();
  
  var pageRegistryWithoutFeatureRoute = [];
  while (experiences.next()) {
    var currPageSysId = experiences.getValue('sys_id');
    var currPageConfig = experiences.getValue('admin_panel');
    var currExperienceName = experiences.getValue('sys_name');
    var currExperienceSysScope = experiences.getValue('sys_scope');
    
    var numOfFeatureRoutes = new global.GlideQuery('sys_ux_page_property')
      .where('page', experiences.sys_id)
      .where('name', 'featureRoutes')
      .count();   
  
    if (numOfFeatureRoutes < 1) {
      pageRegistryWithoutFeatureRoute.push({
        "sys_scope": currExperienceSysScope,
        "experience_name": currExperienceName, 
        "page_registry_sys_id": currPageSysId, 
        "admin_panel_sys_id": currPageConfig
      });
    }
  }
  return pageRegistryWithoutFeatureRoute;
}

// Tranform route properties to match the featureRoute spec.
// Key should be either "optional_parameters" for params or "fields"
function buildMappings(routeRecord, key){
  var mappingObj = [];
  var valueString = routeRecord.getValue(key);
  if (valueString === null){
    return mappingObj;
  }
  var valueList = valueString.split(',');
  valueList.forEach(function(value){
    var valueMap = {
      "name": value,
      "mapping": {
        "address": value
      }
    };
    mappingObj.push(valueMap);
  });
  return mappingObj;
}


function hasRequiredFields(routeRecord, requiredFields){
  if (requiredFields && requiredFields.length > 0){
    var fieldString = routeRecord.getValue('fields');
    if(fieldString === null){
      return false;
    }
    var fieldList = fieldString.split(',');
    fieldList.forEach( function(field){
      if(requiredFields.indexOf(field) == -1){
        return false;
      }
    });
  }
  return true;
}

function buildProp(route){
  var routeFields = buildMappings(route, 'fields');
  var routeParams = buildMappings(route, 'optional_parameters');
  var mappingObj = {};
  mappingObj["_default"] = {
    "routeInfo": {
      "route": route.getValue("route_type"),
      "fields": routeFields,
      "params": routeParams
    }
  };
  return mappingObj;
}

function buildInboxProp(route){
  var routeFields = buildMappings(route, 'fields');
  var routeParams = buildMappings(route, 'optional_parameters');
  var mappingObj = {};
  mappingObj["_default"] = {
    "type": "'VIEWPORT'",
    "routeInfo": {
      "route": "inbox"
    },
    "viewportInfo": {
      "route": route.getValue("route_type"),
      "fields": routeFields,
      "params": routeParams
    }
  };
  return mappingObj;
}

function addRecord (experienceSysId, experienceSysScope, property){
  var propString = JSON.stringify(property);
  var featureRouteProp = new GlideRecord('sys_ux_page_property');
  featureRouteProp.initialize();
  featureRouteProp.setValue('page',experienceSysId);
  featureRouteProp.setValue('name', 'featureRoutes');
  featureRouteProp.setValue('type', 'json');
  featureRouteProp.setValue('sys_scope', experienceSysScope);
  featureRouteProp.setValue('value', propString);
  featureRouteProp.insert();
}


function process () {
  var addedFeatureRoutes = [];
  var pageRegistry = findExperiencesForMacroponents();
  
  pageRegistry.forEach(function(experience){
    var experienceSysId = experience.page_registry_sys_id;
    var experienceAdminConfig = experience.admin_panel_sys_id;
    var experienceName = experience.experience_name;
    var experienceSysScope = experience.sys_scope;
    var routeFeatureProp = {};
    
    //check Inbox
    var inboxRoute = checkInbox(experienceAdminConfig);

    //check Record
    var recordRoute = checkRoutesForScreenID(experienceAdminConfig, recordMacroponentSysId);

    //check List
    var listRoute = checkRoutesForScreenID(experienceAdminConfig, listMacroponentSysId);

    if (recordRoute && hasRequiredFields(recordRoute, ['table', 'sysId'])){
      var recordProp = buildProp(recordRoute);
      routeFeatureProp['record'] = recordProp;
    }
    if (listRoute){
      var listProp = buildProp(listRoute);
      routeFeatureProp['list'] = listProp;
    }
    if (inboxRoute){
      var inboxParams = buildInboxProp(inboxRoute);
      routeFeatureProp['inbox'] = inboxParams;
    }

    if (Object.keys(routeFeatureProp).length > 0){
      addRecord(experienceSysId, experienceSysScope, routeFeatureProp);
      addedFeatureRoutes.push(experienceName);
    }
  });
  if (addedFeatureRoutes.length > 0){
    gs.info("Generate featureRoutes Page Property: Page roperties added for experiences: " + addedFeatureRoutes);
  } else {
    gs.info("Generate featureRoutes Page Property: No page properties were added.");
  }
}

process();
