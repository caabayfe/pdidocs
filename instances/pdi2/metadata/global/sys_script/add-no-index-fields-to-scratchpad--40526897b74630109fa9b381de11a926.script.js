function onDisplay() {
  // Collect No Text Index Field Configurations
  var attributeQuery = new GlideRecord('ais_configuration_attribute');
  attributeQuery.get('attribute', 'no_text_index');
  
  var no_index_fields = [];
  var datasourceOptions = new GlideRecord('ais_datasource_field_attribute');
  datasourceOptions.addQuery('datasource', '975c0985772300102d71af6168106191');
  datasourceOptions.addQuery('attribute', attributeQuery.getUniqueValue());
  datasourceOptions.addQuery('value', true);
  datasourceOptions.query();
  while (datasourceOptions.next()) {
    no_index_fields.push(datasourceOptions.getValue('field'));
    
  }
	g_scratchpad.no_text_index_fields = no_index_fields;
}
onDisplay();
