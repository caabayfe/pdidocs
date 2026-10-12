var count = new GlideAggregate('featured_content');
count.addQuery('topic', parent.sys_id);
count.addAggregate('COUNT');
count.query();
var content = 0;
var limit = GlideApplicationProperty.getValue('taxonomy.content.featured_content_limit');
if (count.next())
    content = count.getAggregate('COUNT');
if (parseInt(content) >= parseInt(limit))
    true;
else false;
