function transform(input) {
    var adminCenterUtil = new AdminCenterUtil();
    return adminCenterUtil.shareViaEmail(JSON.parse(input.users), input.link_to_share, input.custom_message);
}
