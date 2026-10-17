function transform(input) {
    var hideOrShow = '';
    var displayMsg = '';

    var response = new sn_vsc.CustomerActionUtils().shouldHideAlert(input.sys_id);
    return {
        'hideOrShow': response.hideAlertResponse,
        'displayMsg': {
            'type': 'string',
            'value': response.alertMessage
        }
    };
}
