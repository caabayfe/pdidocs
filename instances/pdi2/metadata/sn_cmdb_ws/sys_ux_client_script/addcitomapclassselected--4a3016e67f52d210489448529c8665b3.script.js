function script({ api, event }) {
	//addCiToMapClassSelected function fired in mapSearchFilterController when class selected in add ci to map panel for edit mode
	api.setState("selectedClassAddCiToMap", event.payload.selectedClass);
	api.setState("addCiPriorClassQuery", api.state.addCiToMapCBQuery);
}
