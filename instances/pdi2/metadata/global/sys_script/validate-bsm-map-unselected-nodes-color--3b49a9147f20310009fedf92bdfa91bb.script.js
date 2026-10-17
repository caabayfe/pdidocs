function onBefore(current, previous) {
	var str = current.value;
	var format = new ValidateColorFormatUtil();
	if (!format.validColorName(str) &&
	    !format.validRGBColor(str) &&
	    !format.validHexColor(str))
	{
		gs.addInfoMessage(gs.getMessage("'" + str + "' is not a valid color format or name for unselected CI nodes. Color value was changed back to '" + previous.value + "'."));
		current.value = previous.value;
	} 
}
