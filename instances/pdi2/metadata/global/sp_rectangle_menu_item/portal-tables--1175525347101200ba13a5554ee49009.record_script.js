var items = data.items = [];
data.count = 0;
data.omitBadge = true;
var gr = new GlideRecord('sys_db_object');
gr.addQuery('name', 'STARTSWITH', 'sp_');
gr.query()
while (gr.next())
  add(GlideTableDescriptor.get(gr.getValue('name')).getLabel(), gr.getValue('name'));

items.sort(function(a, b){
  var x = a.title.toLowerCase();
  var y = b.title.toLowerCase();
  if (x < y)
    return -1;
  
  if (x > y)
    return 1;
  
  return 0;
});

function add(title, table) {
  data.count++;
  var link = {};
  link.title = title;
  link.type = 'link';
  link.href = '?id=lf&table=' + table;
  items.push(link);
}
