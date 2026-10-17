function transform(input) {
    var adminCenterUtil = new AdminCenterUtil();
    return adminCenterUtil.shareAdminHomeLandingPageFeedback(input.star_ratings, input.optional_message, input.contact_permission);
}
