var EXISTING_PORTAL_ID = 'cbaf04630b603200d8cf0d0737673a8e';
var PAGE_ROUTE_MAP_ID = '69eeb3843b3113003585802b13efc4ec';

var grPortal = new GlideRecord('sp_portal');
var grRouteMap = new GlideRecord('sp_page_route_map');

if (grPortal.get(EXISTING_PORTAL_ID) && grRouteMap.get(PAGE_ROUTE_MAP_ID)) {
	grRouteMap.portals = grRouteMap.portals + ',' + EXISTING_PORTAL_ID;
	grRouteMap.update();
}
