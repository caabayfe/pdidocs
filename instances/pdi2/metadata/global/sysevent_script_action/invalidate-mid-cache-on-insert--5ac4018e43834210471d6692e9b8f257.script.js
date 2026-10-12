var sysIds = current.select_records_for_signing.split(',');
var threshold = 10;

if (sysIds.length >= threshold || event.parm1 =='mass_sign_records') {
	new InvalidateMIDScriptCache().invalidateEntireMidScriptIncludeCache();
} else {
    for (var i = 0; i < sysIds.length; i++) {
        new InvalidateMIDScriptCache().invalidateMidScriptIncludeCache(sysIds[i]);
    }
}
