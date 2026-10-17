function transform(input) {
    var parentPage = input.parentPage;
    var resObj = new sn_itam_recomm.ImportantActionUtils().refreshImpActionsDataForDashboard(parentPage);
    if (resObj.cards_metadata && resObj.cards_metadata.length > 0) {
        for (var i = 0; i < resObj.cards_metadata.length; i++) {
            if (gs.nil(resObj.cards_metadata[i].metaData2)) {
                resObj.cards_metadata[i].hideMetaData2 = true;
            }
        }
    }
    return resObj;
}
