(function executeRule(current, previous /*null when async*/) {

	var screenClassName = current.getElement("segment").getElementValue("segment.screen.sys_class_name");
	var itemClassName = current.getElement("item_stream").getElementValue("item_stream.sys_class_name");
	
	var isLocationItemStream = itemClassName === "sys_sg_location_item_stream";
	var isMapScreen = screenClassName === "sys_sg_custom_map_screen" ||  screenClassName === "sys_sg_map_screen";
	
	if(!isMapScreen && !isLocationItemStream)
		return;
	
	if(isMapScreen && isLocationItemStream) {
		var util = new LocationItemStreamUtil();
		var isValid = util.areSegmentParentScreensValid(current, current.getElement("item_stream").getRefRecord());
		current.setAbortAction(!isValid);
	}

})(current, previous);
