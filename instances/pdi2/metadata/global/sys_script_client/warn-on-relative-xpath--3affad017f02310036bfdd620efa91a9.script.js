function onLoad() {
	if (g_form.getValue('type') != 'File')
		return;

	if (g_form.getValue('format') != 'XML')
		return;

	if (g_form.getValue('xpath_root_node').trim().indexOf('//') < 0)
		return;
	
	g_form.showFieldMsg('xpath_root_node', new GwtMessage().getMessage('Relative XPath expression is not recommended and can impact instance performance'),'warning');
	g_form.addWarningMessage(new GwtMessage().getMessage('WARNING: Relative XPath expressions are not recommended and can impact instance performance when importing large XML files. Consider using an absolute XPath instead. <a target="_blank" href="http://docs.servicenow.com/?context=CSHelp:XML_Data_Source_Absolute_XPath#Example_XML_data_source_file">Read More</a>'));
}
