(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
  var sysId = request.pathParams.sysId;
  var format = sn_mab_api.McbResultFormats.viewTemplateFormat;

  var util = new sn_mab_api.McbGlideRecordUtil(format);
  if (util.verifyAuth('sys_sg_view_template', sysId)) {
    var viewTemplateHM = util.getTemplate(sysId);

    return viewTemplateHM;
  } else {
    response.setStatus(401);
  }
})(request, response);
