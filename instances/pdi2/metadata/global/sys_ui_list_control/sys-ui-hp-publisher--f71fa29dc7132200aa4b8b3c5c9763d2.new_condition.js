var answer;
var gr = new GlideRecord("sys_ui_hp_cascading_filter");
gr.addQuery("publisher_reference", parent.sys_id);
gr.query();
//Don't allow more than one mapping
if(gr.getRowCount() > 0){
  answer=true;
}
else{
  answer=false;
}
answer;
