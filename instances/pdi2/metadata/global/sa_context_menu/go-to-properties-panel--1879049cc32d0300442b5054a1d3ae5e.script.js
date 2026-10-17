/**
   * Script executed on the client for this menu action
   * 'item' is a reference to the map's node or link
   * 'item.id' is equal to the sys_id of the Configuration Item or Relationship
   * 'builderArgs' - if item type is Node or Relationship, then builderArgs will provide extended arguments about the current item, such as incoming endpoints and originalEdge object.
  **/ 

var sncMapGlobals = $injector.get("sncMapGlobals");
var saBsGlobals = $injector.get("saBsGlobals");

if (sncMapGlobals && saBsGlobals) {
	sncEventScope.broadcast(sncMapGlobals.EVT_SELECTION_UPDATED, saBsGlobals.BS_ID);
	sncEventScope.broadcast(sncGlobals.EVT_SET_PROPERTIES_PANEL_FOCUS);
}
 
