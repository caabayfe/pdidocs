(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
  var sysId = request.pathParams.sysId;

  var formatName = request.queryParams.format
    ? request.queryParams.format[0]
    : "viewConfigFormat";
  var formatList = new sn_mobile_card_bui.McbResultFormats();
  var format = formatList.getFormat(formatName);

  var util = new sn_mobile_card_bui.McbGlideRecordUtil(format);
  if (util.verifyAuth('sys_sg_view_config', sysId)) {
    var viewConfigHM = util.getCard(sysId);
    var viewTemplateHM = util.getTemplate(viewConfigHM["template"], false);
    var uIRuleHMs = util.getUiRules(sysId);

    viewConfigHM["template"] = viewTemplateHM;
    viewConfigHM["mobileUiRules"] = uIRuleHMs;

    return viewConfigHM;
  } else {
    response.setStatus(401);
  }
})(request, response);
