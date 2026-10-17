GlideSysLog.info("AIS-FixScript", "Starting 'Update AIS Locale Selection' Script");
var columns = new GlideRecord('sys_dictionary');
columns.addQuery('name', 'IN', 'ais_dictionary,ais_rule');
columns.addQuery('element', 'locale');
columns.query();
var ruleAttributes = ['is_searchable_choice=true', 'choice_script=new global.AisLanguageChoiceList().process(true)'];
var dictionaryAttributes = ['is_searchable_choice=true', 'choice_script=new global.AisLanguageChoiceList().process(false)'];
while (columns.next()) {
    var curAttributes = columns.getValue('attributes');
    var table = columns.getValue('name');
    var element = columns.getValue('element');
    var name = table + "." + element;
    var newAttributes = dictionaryAttributes;
	
    if (table == 'ais_rule') 
		newAttributes = ruleAttributes;
    columns.setValue('attributes', newAttributes.join(','));
	
    GlideSysLog.info("AIS-FixScript", "Updating " + name + " to " + newAttributes.join(','));
    columns.setValue('choice_field', null);
    columns.setValue('choice_table', null);
    GlideSysLog.info("AIS-FixScript", "Updating " + name + " choice to 3");
    columns.setValue('choice', 3);
    columns.update();
}
