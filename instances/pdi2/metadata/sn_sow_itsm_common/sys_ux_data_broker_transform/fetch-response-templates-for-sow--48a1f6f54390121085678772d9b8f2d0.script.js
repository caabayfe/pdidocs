function transform(input) {
    var table = input.table;
    var responseTemplate = new sn_sow_itsm_common.ResponseTemplateSOW();
    var sysId = input.sysId;
    var search = '';
    var count = 100;
    var offset = 0;
    var channel = responseTemplate.CHANNEL_FORM;

    var opts = {
        channel: channel
    };
    var responses = responseTemplate.query(table, sysId, search, count, offset, true, '', opts);
    var results = JSON.parse(responses);
    return results;
}
