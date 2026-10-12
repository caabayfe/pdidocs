template.print("Summary of Requested items:<br />");  
var gr = new GlideRecord("sc_req_item");
gr.addQuery("request", current.sysapproval);
gr.query();
while(gr.next()) {
  template.print(gr.number + ":  " + gr.quantity + " X " + gr.cat_item.getDisplayValue() + " at " + gr.cat_item.price.getDisplayValue() + " each <br />");
}
