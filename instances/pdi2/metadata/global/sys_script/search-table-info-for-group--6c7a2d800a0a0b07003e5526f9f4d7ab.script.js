var answer = '';
var label = '';
var grouptables = new GlideRecord('ts_table');
grouptables.addQuery('group',current.group);
grouptables.orderBy('name');
grouptables.query();
while (grouptables.next()) {
  label = GlideMetaData.getTablePlural(grouptables.name)
  if (answer == '')
    answer = label + '';
  else
    answer = answer + ', ' + label;
}
var group = new GlideRecord('ts_group');
group.get(current.group);
group.tables = answer;
group.update();
