loadPage(gel('table_name').value, gel('field_name').value);

function loadPage(tableName, elementName) {
	var t = Table.get(tableName);
	var e = t.getElement(elementName);
	
	gel('dictionary_viewer.table').innerHTML = e.getTableName();
	gel('dictionary_viewer.element').innerHTML = e.getName();
	gel('dictionary_viewer.type').innerHTML = e.getType();
	gel('dictionary_viewer.max_length').innerHTML = e.getMaxLength();
	if (e.getReference() == null)
		gel('dictionary_viewer.reference.tr').style.display = "none";
	else
		gel('dictionary_viewer.reference').innerHTML = e.getReference();
	if (e.getRefQual() == null || e.getRefQual() == '')
		gel('dictionary_viewer.reference_qual.tr').style.display = "none";
	else
		gel('dictionary_viewer.reference_qual').innerHTML = e.getRefQual();
	if (e.getDependent() == null)
		gel('dictionary_viewer.dependent.tr').style.display = "none";
	else
		gel('dictionary_viewer.dependent').innerHTML = e.getDependent();
	var attrs = e.getAttributes();
	if (attrs == '')
		gel('dictionary_viewer.attributes.tr').style.display = "none";
	else {
		attrs = attrs.replace(/,/g, ',​'); // hidden character after comma to help with line breaking
		gel('dictionary_viewer.attributes').innerHTML = attrs;
	}
}
