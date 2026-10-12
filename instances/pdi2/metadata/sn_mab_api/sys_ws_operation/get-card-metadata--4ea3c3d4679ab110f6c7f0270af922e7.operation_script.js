(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
      var sysId = request.pathParams.sysId;
      var format = sn_mab_api.McbResultFormats.viewConfigFormat;
    
      var util = new sn_mab_api.McbGlideRecordUtil(format);
      if (util.verifyAuth('sys_sg_view_config', sysId)) {
        var viewConfigHM = util.getCard(sysId);
        var viewTemplateHM = util.getTemplate(viewConfigHM["template"], false);
        var uIRuleHMs = util.getUiRules(sysId);
    
        viewConfigHM["templateView"] = viewTemplateHM;
        viewConfigHM["mobileUiRules"] = uIRuleHMs;
    
        return viewConfigHM;
      } else {
        response.setStatus(401);
      }
    })(request, response);
