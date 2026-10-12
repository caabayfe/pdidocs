(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
  var sysId = request.pathParams.sysId;

  var formatName = request.queryParams.format
    ? request.queryParams.format[0]
    : "viewTemplateFormat";
  var formatList = new sn_mobile_card_bui.McbResultFormats();
  var format = formatList.getFormat(formatName);

  var util = new sn_mobile_card_bui.McbGlideRecordUtil(format);
  if (util.verifyAuth('sys_sg_view_template', sysId)) {
    var viewTemplateHM = util.getTemplate(sysId);

    return viewTemplateHM;
  } else {
    response.setStatus(401)
  }
})(request, response);
