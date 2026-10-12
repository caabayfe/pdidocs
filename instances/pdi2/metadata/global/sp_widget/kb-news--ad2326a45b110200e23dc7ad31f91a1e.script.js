var t = data;
var DEFAULT_KB_CATEGORY = "0a86f3cbff0221009b20ffffffffff81";
var z = new GlideRecord('kb_knowledge');

var kbCat = options.kb_category;
if (typeof kbCat !== 'string' || !GlideStringUtil.isEligibleSysID(kbCat))
  kbCat = DEFAULT_KB_CATEGORY;

var maxNumber = parseInt(options.max_number, 10);
if (isNaN(maxNumber) || maxNumber <= 0)
  maxNumber = 5;

z.addQuery('kb_category', kbCat);
z.addQuery('workflow_state', 'published');
z.addQuery('valid_to', '>=', (new GlideDate()).getLocalDate().getValue());
z.addQuery('language', gs.getUser().getLanguage());
z.orderByDesc('published');
z.setLimit(maxNumber);
z.query();
t.articles = [];
t.title = options.title || gs.getMessage("News");

while (z.next()) {
  if (!z.canRead())
    continue;

  var a = {};
  a.short_description = z.getValue('short_description');
  a.sys_view_count = z.getValue('sys_view_count');
  a.sys_id = z.getValue('sys_id');
  a.published = z.getValue('published');
  a.published_display = gs.getMessage("Published {0}", z.getDisplayValue('published'));
  t.articles.push(a);
}
t.rowCount = t.articles.length;
