changeKnowledgeSearchOption();

function changeKnowledgeSearchOption() {
  var gr = new GlideRecord('sys_user_preference');
  gr.addQuery("system", "true");
  gr.addQuery("name", "knowledge.search.sort.field");
  gr.query();
  if (gr.next()) {
    gr.value = current.value;
    gr.update();
  }
}
