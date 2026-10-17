//Switch runManually to true in order to run this script
var runManually = false;
if (runManually) {
    var util = new sn_me.MobileNextExpUpgradeUtil();
    revertPeopleGeniusResultCard();
    revertUserProfileItemView();
}

function revertUserProfileItemView() {
    util.switchLegacyView("sys_sg_form_screen", "37917d004d0c2010f87749679b47748f", "a006ed9707b81910264f78e99cd300a6", false);
}

function revertPeopleGeniusResultCard() {
    util.switchConnection("sys_sg_master_item", "view_config", "e4aa87ccc7331010d558c943c7c260ee", "5231be0c772511109033bfeacf5a99c6", "3eeacbccc7331010d558c943c7c26049");
}
