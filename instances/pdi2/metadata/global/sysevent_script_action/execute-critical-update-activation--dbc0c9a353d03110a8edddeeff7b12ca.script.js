var SCHEDULED_UPDATE_ACTIVATION = "b160fd2953503110a8edddeeff7b1220";
var gr = new GlideRecord("sysauto_script");
if (gr.get(SCHEDULED_UPDATE_ACTIVATION))
    gs.executeNow(gr);

new global.CriticalUpdateUtil().cancelPreviousPBAfterUpgrade();
new global.CriticalUpdateUtil().fixIncorrectlyCancelledPB();
