//Switch runManually to true in order to run this script
var runManually = false;
if (runManually) {
    var util = new sn_me.MobileNextExpUpgradeUtil();
    revertRFYCard();
}

function revertRFYCard() {
    var rfy = [
        //Recommended For You Articles	
        {
            "masterItem": "f92d2b2feb3101103d6b2ff2a25228f7",
            "newCard": "3b0dbd55534d1110fedfddeeff7b1252",
            "oldCard": "5650b3efeb3101103d6b2ff2a2522884"
        },
        //Recommended For You Request
        {
            "masterItem": "8e21bbefeb3101103d6b2ff2a252281f",
            "newCard": "528cca51538d1110fedfddeeff7b12c8",
            "oldCard": "0c31fbefeb3101103d6b2ff2a25228ec"
        },
        //Recommended For You Request without image
        {
            "masterItem": "7d470fa4eb0201103d6b2ff2a2522818",
            "newCard": "228e4ad1538d1110fedfddeeff7b122b",
            "oldCard": "a8484be4eb0201103d6b2ff2a25228a3"
        }
    ];

    rfy.forEach(function revertEachLink(link) {
        util.switchConnection("sys_sg_master_item", "view_config", link.masterItem, link.newCard, link.oldCard);
    });
}
