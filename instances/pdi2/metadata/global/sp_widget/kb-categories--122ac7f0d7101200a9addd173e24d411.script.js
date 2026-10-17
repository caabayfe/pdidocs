// populate the 'data' object
// Kill switch for DEF0886936. Defaults to true.
var enforceKBCategoryACL = gs.getProperty('glide.service_portal.widget.kb_categories.enforce_acl', 'true') === 'true';
var t = enforceKBCategoryACL ? new GlideRecordSecure('kb_category') : new GlideRecord('kb_category');
gs.print("kb_knowledge_base: " + $sp.getValue('kb_knowledge_base'));
t.addQuery('parent_id', $sp.getValue('kb_knowledge_base'));
t.query();

data.categories = [];
while (t.next()) {
  var articles = $sp.getKBCategoryArticles(t.getUniqueValue());
  //if (articles.length == 0)
  //  continue;
  
  var category = {
    'value' : t.getUniqueValue(),
    'label' : t.getValue('label')
  };
  data.categories.push(category);
}
