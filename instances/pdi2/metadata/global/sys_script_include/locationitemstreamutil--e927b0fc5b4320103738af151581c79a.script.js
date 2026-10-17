var LocationItemStreamUtil = Class.create();

LocationItemStreamUtil.prototype = {
	
    initialize: function() {
    },
    
	areSegmentParentScreensValid: function(segment, locationItemStream) {
		var className = segment.getElement("segment").getElementValue("segment.screen.sys_class_name");
		var customMapScreenMismatch = locationItemStream.getValue("is_custom_location") === "1" && className !== "sys_sg_custom_map_screen";
		var mapScreenMismatch = locationItemStream.getValue("is_custom_location") === "0" && className !== "sys_sg_map_screen";

		if(customMapScreenMismatch || mapScreenMismatch) {
			if(customMapScreenMismatch)
				gs.addErrorMessage(gs.getMessage("The field 'Is Custom Location' must be set to false in the Map location stream record if it is associated to an Item Stream Segment record whose parent is a Map Screen"));
			else
				gs.addErrorMessage(gs.getMessage("The field 'Is Custom Location' must be set to true in the Map location stream record if it is associated to an Item Stream Segment record whose parent is a Custom Map Screen"));

			return false;
		}	
		
		return true;
	},

    type: "LocationItemStreamUtil"
	
};
