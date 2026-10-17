function transform(input) {
    var parentPage = input.parentPage;
    return new sn_itam_recomm.ImportantActionUtils().getRefreshStatusOnDashboard(parentPage);
}
