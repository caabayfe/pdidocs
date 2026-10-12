var gr = new GlideRecord("incident");
gr.addQuery('priority', '1');
gr.addActiveQuery();
gr.query();
while (gr.next()) {
	if(gr.location.latitude && gr.location.longitude){
	   var item = map.addItem(gr);
	   item.latitude = String(gr.location.latitude);
	   item.longitude = String(gr.location.longitude);
	   item.dialog_title = gr.getDisplayValue();
	   item.icon = "https://maps.google.com/mapfiles/kml/pal3/icon51.png";
	   item.icon_width = "32";
	   item.icon_height = "32";
	}
}
