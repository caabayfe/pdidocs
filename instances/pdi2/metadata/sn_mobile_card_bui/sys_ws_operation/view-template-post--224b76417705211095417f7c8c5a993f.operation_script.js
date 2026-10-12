(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
  var template = request.body.data.template;
  var scope = request.body.data.scope;

  var templateRepo = new sn_mobile_card_bui.ViewTemplateRepository();
  var newTemplate = templateRepo.save(template, scope);
  var newTemplateSysId = newTemplate.getUniqueValue();

  var formatName = "viewTemplateFormat";
  var formatList = new sn_mobile_card_bui.McbResultFormats();
  var format = formatList.getFormat(formatName);

  var util = new sn_mobile_card_bui.McbGlideRecordUtil(format);
  var includeViewConfigs = false;
  var viewTemplateHM = util.getTemplate(newTemplateSysId, includeViewConfigs);

  return viewTemplateHM;
})(request, response);
