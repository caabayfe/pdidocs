(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
  var sysId = request.pathParams.sysId;
  var cardChanges = request.body.data.viewConfig;

  var templateRepo = new ViewConfigRepository();
  templateRepo.update(sysId, cardChanges);

  var formatName = "viewConfigFormat";
  var formatList = new sn_mobile_card_bui.McbResultFormats();
  var format = formatList.getFormat(formatName);

  var util = new sn_mobile_card_bui.McbGlideRecordUtil(format);
  var viewConfigHM = util.getCard(sysId);
  var includeCardData = false;
  var viewTemplateHM = util.getTemplate(
    viewConfigHM["template"],
    includeCardData
  );
  var uIRuleHMs = util.getUiRules(sysId);

  viewConfigHM["template"] = viewTemplateHM;
  viewConfigHM["mobileUiRules"] = uIRuleHMs;

  return viewConfigHM;
})(request, response);
