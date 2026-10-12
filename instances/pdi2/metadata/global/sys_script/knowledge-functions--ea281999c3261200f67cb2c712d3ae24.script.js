// if there is only one active KB, return it
function getDefaultKB() {
  var gr = new GlideRecord('kb_knowledge_base');
  gr.addQuery('active', 'true');		
  gr.query();
  if(gr.getRowCount()==1 && gr.next()) {
    return gr.sys_id;
  }		
}
