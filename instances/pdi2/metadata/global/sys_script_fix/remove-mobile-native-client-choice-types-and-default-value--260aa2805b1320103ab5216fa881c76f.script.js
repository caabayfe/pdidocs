var choiceGR = new GlideRecord('sys_choice');
choiceGR.addQuery('name', 'sys_sg_native_client');
choiceGR.query();
while (choiceGR.next())
choiceGR.deleteRecord();

var gr = new GlideRecord('sys_dictionary');
gr.addQuery('name', 'sys_sg_native_client');
gr.addQuery('element','type');
gr.query();
if (gr.next()) {
gr.setValue('default_value','');
gr.update();
}
