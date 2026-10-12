(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
  var sysId = request.pathParams.sysId;
  var templateChanges = request.body.data.template;

  var templateRepo = new ViewTemplateRepository();
  templateRepo.update(sysId, templateChanges);

  var formatName = "viewTemplateFormat";
  var formatList = new sn_mobile_card_bui.McbResultFormats();
  var format = formatList.getFormat(formatName);

  var util = new sn_mobile_card_bui.McbGlideRecordUtil(format);
  var viewTemplateHM = util.getTemplate(sysId);

  return viewTemplateHM;
})(request, response);
