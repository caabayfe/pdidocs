//Switch runManually to true in order to run this script
var runManually = false;
if (runManually) {
    var util = new sn_me.MobileNextExpUpgradeUtil();
    revertUserProfileItemView();
    revertPeopleSearchItemView();
    revertStaticMediaContentUISection();
    revertTopicCards();
}

function revertUserProfileItemView() {
    util.switchLegacyView("sys_sg_form_screen", "ccab364687103300a785940307cb0b0c", "a006ed9707b81910264f78e99cd300a6", false);
    util.switchLegacyView("sys_sg_form_screen", "7b8663d0ff203300a78526f6793bf119", "a006ed9707b81910264f78e99cd300a6", false);
}

function revertPeopleSearchItemView() {
    util.switchLegacyView("sys_sg_master_item", "6fbe9f587320330018eea18d4ef6a749", "ae7afcf4775111108f64b2487b5a9939", false);
}

function revertTopicCards() {
     util.switchConnection('sys_sg_master_item', 'view_config', '96ce9f76c778301028f8c943c7c260b2', '3860e6ed077d5110264f78e99cd300ec', 'cc742327c3e03010069aec4b7d40dd56');
     util.switchConnection('sys_sg_master_item', 'view_config', '2b3ff6efc3603010069aec4b7d40ddcf', '3860e6ed077d5110264f78e99cd300ec', 'cc742327c3e03010069aec4b7d40dd56');
}

function revertStaticMediaContentUISection() {
    util.switchConnection('sys_sg_applet_launcher_m2m_section', 'section', 'ab40b9dac3b65010a0b3ec4b7d40dd38', 'edb839f1777911109033bfeacf5a9973', '891fed9ac3b65010a0b3ec4b7d40dd25');
}
