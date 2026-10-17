var gr = new GlideRecord('discovery_range');
gr.addQuery('name', 'Private IP Addresses');
gr.addActiveQuery();
gr.query();
if (!gr.next()) {
   gr.initialize();
   gr.name = 'Private IP Addresses';
   gr.insert();
}
var url = 'discovery_range.do?sys_id=' + gr.sys_id;
action.setRedirectURL(url);
