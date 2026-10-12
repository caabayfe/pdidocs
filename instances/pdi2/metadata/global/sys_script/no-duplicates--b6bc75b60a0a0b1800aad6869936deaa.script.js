// Prevent duplicate table entries
var dict = new GlideRecord('sys_dictionary');
dict.addQuery('element','');
dict.addQuery('name',current.name);
dict.query();
if (dict.next()) {
  current.name.setError("A dictionary record already exists with the same "+ GlideMetaData.getTableFieldLabel('sys_dictionary','name') +" and " + GlideMetaData.getTableFieldLabel('sys_dictionary','element'));
  current.setAbortAction(true);
}
