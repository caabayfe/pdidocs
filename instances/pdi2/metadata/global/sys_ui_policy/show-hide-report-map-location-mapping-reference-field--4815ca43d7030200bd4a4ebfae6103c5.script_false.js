function onCondition() {
	var list = $$('div[tab_caption="Report Map Location Mappings"]')[0];
	if(list.hasClassName('embedded')){
	   list.hide();
	}
}
