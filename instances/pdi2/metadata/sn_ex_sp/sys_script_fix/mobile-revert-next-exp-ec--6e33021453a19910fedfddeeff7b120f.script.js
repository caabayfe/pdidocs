//Switch runManually to true in order to run this script
var runManually = false;
if (runManually) {
    var util = new sn_me.MobileNextExpUpgradeUtil();
    revertFavoritesCard();
}

function revertFavoritesCard() {
    var favorites = [
        //favorites (with image)
        {
            "masterItem": "67d525ca773101108f64b2487b5a992e",
            "newCard": "737198bb777811109033bfeacf5a99ad",
            "oldCard": "d21629ca773101108f64b2487b5a9974"
        },
        //favorites (without image)
        {
            "masterItem": "a466a9ca773101108f64b2487b5a99f1",
            "newCard": "d5fb80b377f411109033bfeacf5a99e4",
            "oldCard": "de36e5ca773101108f64b2487b5a99ca"
        }
    ];

    favorites.forEach(function revertEachLink(link) {
        util.switchConnection("sys_sg_master_item", "view_config", link.masterItem, link.newCard, link.oldCard);
    });
}
