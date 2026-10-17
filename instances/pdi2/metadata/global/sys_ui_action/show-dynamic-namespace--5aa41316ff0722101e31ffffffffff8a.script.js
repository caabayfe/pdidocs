var attributes = new GlideAttributes(current.attributes);
var namespaceName = attributes.getAttribute('dynamic_namespace');

var gr = new GlideRecord("dynamic_namespace");
gr.addQuery("name", namespaceName);
gr.query();
if (gr.next()) {
	var url = "dynamic_namespace.do?sys_id=" + gr.sys_id;
	gs.setRedirect(url);
}
