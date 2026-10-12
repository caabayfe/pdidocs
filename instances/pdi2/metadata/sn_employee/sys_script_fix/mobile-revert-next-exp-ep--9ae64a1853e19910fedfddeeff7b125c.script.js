//Switch runManually to true in order to run this script
var runManually = false;
if (runManually) {
    var util = new sn_me.MobileNextExpUpgradeUtil();
    revertEmployeeProfileCard();
}

function revertEmployeeProfileCard() {
    var ep = [
        //Coworker List Item Config
        {
            "masterItem": "47a5c9051b3fb010322f0fe0604bcb44",
            "newCard": "8049edec07c95910264f78e99cd30031",
            "oldCard": "b2ac74891bfbb010322f0fe0604bcb4e",
            "table": "sys_sg_master_item"
        },
        //Direct Reports List Item Config	
        {
            "masterItem": "b0e209411b3fb010322f0fe0604bcb01",
            "newCard": "8049edec07c95910264f78e99cd30031",
            "oldCard": "b2ac74891bfbb010322f0fe0604bcb4e",
            "table": "sys_sg_master_item"
        },
        //Manager List Item Config	
        {
            "masterItem": "bc2f344d1bfbb010322f0fe0604bcb0c",
            "newCard": "8049edec07c95910264f78e99cd30031",
            "oldCard": "b2ac74891bfbb010322f0fe0604bcb4e",
            "table": "sys_sg_master_item"
        },
        //Selected User Profile	
        {
            "masterItem": "7c3945c8535001106d79ddeeff7b1240",
            "newCard": "ffbaec1107459910264f78e99cd300a1",
            "oldCard": "813e4100539001106d79ddeeff7b12d7",
            "table": "sys_sg_form_screen"
        }
    ];

    ep.forEach(function revertEachLink(link) {
        util.switchConnection(link.table, "view_config", link.masterItem, link.newCard, link.oldCard);
    });
}
