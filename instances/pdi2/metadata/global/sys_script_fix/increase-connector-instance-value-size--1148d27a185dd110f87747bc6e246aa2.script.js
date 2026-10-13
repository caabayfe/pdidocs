// accessing sys dictionary record of value
var gr = new GlideRecord('sys_dictionary');
gr.addEncodedQuery("name=em_connector_instance_value^element=value");
gr.query();

while (gr.next()) {
    // setting max_length to 1024
    if (parseInt(gr.getValue('max_length')) < 1024) {
        gr.setValue('max_length', 1024);
        gr.update();
    }
}
