var gr = new GlideRecord("cmn_location");
gr.addEncodedQuery("latitudeISNOTEMPTY^longitudeISNOTEMPTY");
gr.query();
while (gr.next()) {
   var item = map.addItem(gr);
   item.latitude = gr.getValue('latitude');
   item.longitude = gr.getValue('longitude');
   item.dialog_title = gr.getDisplayValue();
   item.icon_width = "16";
   item.icon_height = "16";
}
