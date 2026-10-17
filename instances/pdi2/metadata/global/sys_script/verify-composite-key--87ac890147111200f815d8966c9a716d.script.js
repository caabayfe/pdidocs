var collision = new GlideRecord("sys_embedded_help_content");
collision.addActiveQuery();
collision.addQuery("page", current.page);
collision.addQuery("modifier", current.modifier);
collision.addQuery("product", current.product);
collision.addQuery("snc_created", current.snc_created);
collision.addQuery("version", current.version);
collision.addQuery("sys_domain", current.sys_domain);

if (GlideStringUtil.notNil(current.role))
	collision.addQuery("role", current.role);
else
	collision.addNullQuery("role");

if (current.isValidRecord() && GlideStringUtil.notNil(current.sys_id))
	collision.addQuery("sys_id", "!=", current.sys_id);

if (GlideStringUtil.notNil(current.qualifier))
	collision.addQuery("qualifier", current.qualifier);
else
	collision.addNullQuery("qualifier");
collision.query();
if (collision.next()) {
	gs.addErrorMessage(gs.getMessage("Embedded Help Composite Key Validation"));
	current.setAbortAction(true);
}
