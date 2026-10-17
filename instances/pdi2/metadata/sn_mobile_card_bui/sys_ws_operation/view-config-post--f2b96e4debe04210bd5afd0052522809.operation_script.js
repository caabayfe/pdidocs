(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
      var viewConfig = request.body.data.viewConfig;
      var scope = request.body.data.scope;

      var viewConfigRepo = new sn_mobile_card_bui.ViewConfigRepository();
      var newViewConfig = viewConfigRepo.save(viewConfig, scope);
      var newViewConfigSysId = newViewConfig.getUniqueValue();

      var formatName = "viewConfigFormat";
      var formatList = new sn_mobile_card_bui.McbResultFormats();
      var format = formatList.getFormat(formatName);

      var util = new sn_mobile_card_bui.McbGlideRecordUtil(format);
      var viewConfigHM = util.getCard(newViewConfigSysId);

      return viewConfigHM;
    })(request, response);
    
