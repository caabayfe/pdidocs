var gr = new GlideRecord('sys_documentation');
gr.addQuery('name', 'sys_cs_channel');
gr.addQuery('element', 'whitelisted');
gr.addQuery('language', 'en');
gr.query();
if(gr.next() && gr.getValue('label') == 'Whitelisted') {
    gr.setValue('label', 'Opted in all topics by default');
    gr.update();
}
