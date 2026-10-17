answer = false;
// Table names which start with ZZ_YY and invisible prefix will be handled before scan
var tableName = current.table_name;
var td = GlideTableDescriptor.get(tableName);
if (td.isValid())
	answer = !td.getED().getBooleanAttribute("suppress_antivirus_email_notification");
