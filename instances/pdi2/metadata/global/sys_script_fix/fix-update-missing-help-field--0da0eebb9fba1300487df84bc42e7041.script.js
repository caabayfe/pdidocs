var gr = new GlideRecord("sys_documentation");
gr.addQuery('name','v_ws_creator');
gr.addQuery('label','Create Web Service');
gr.addQuery('help', '');
gr.query();
if(gr.getRowCount() == 1 && gr.next()) {
gr.setValue('help','This type of web service will transform the incoming data synchronously based on the associated transform maps by default. Web Service Import Sets complement Direct Web Services and Scripted Web Services in providing a web service interface to Import Set tables.');
gr.update();
}
