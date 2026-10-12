function onChange(control, oldValue, newValue, isLoading, isTemplate) {
  if (newValue == '')
     return;

  // Changes the label of file_format_indicator field based on the value selected
  // in the select_icon_by choice list
  var choiceList = $('sys_attachment_icon_rule.select_icon_by');
  var label = $$("label[for='sys_attachment_icon_rule.file_format_indicator']")[0];
  var fileExtension = getMessage("File extension");
  var mimeType = getMessage("MIME type");
  if (choiceList.select('option[value="file_extension"]')[0].selected)
	label.update(fileExtension + ":");
  else if (choiceList.select('option[value="mime_type"]')[0].selected)
	label.update(mimeType + ":");
}
