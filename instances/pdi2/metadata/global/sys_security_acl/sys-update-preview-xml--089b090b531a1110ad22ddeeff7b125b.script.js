var ra = false;
var appId;

if (gs.nil(current.remote_update) || gs.nil(current.remote_update.application))
	appId = 'global';
else
	appId = current.remote_update.application;

var gr = attemptAppLoad(appId);
ra = isDelegatedDeveloper() && gr.canRead();
ra;
function isDelegatedDeveloper() {
        return gs.hasRole('delegated_developer') && !gs.hasRole('admin');
}
function attemptAppLoad(appId) {
        var gr = new GlideRecord("sys_app");
        if (!gr.get(appId))
            gs.error("Invalid application id " + appId);
        return gr;
}
