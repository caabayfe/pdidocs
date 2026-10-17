(function() {
    data.cardData = options;
    data.title = data.cardData.title;
    data.secondaryData = data.cardData.description;
    data.url = data.cardData.url;
    data.timestamp = data.cardData.timestamp;
    data.status = data.cardData.status;
    data.sysID = data.cardData.sysID;
    data.actionConfig = options.actionConfig;
    data.supportedColors = new sn_ex_sp.RequestUtil().getLabelColorBackground() || {};
})();
