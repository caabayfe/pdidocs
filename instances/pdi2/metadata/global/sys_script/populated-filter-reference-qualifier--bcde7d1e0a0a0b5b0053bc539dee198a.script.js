function populatedFilterRefQual() {
  var views = "sys_idIN";
  var list = new GlideRecord('sys_ui_list');
  list.addQuery('name',current.name);
  list.query();
  while (list.next())
    views += list.view +',';
  views = views.slice(0,-1);
  return views;

}
