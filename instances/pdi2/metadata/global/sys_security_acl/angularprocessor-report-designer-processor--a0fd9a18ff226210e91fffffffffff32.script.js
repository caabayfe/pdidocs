var answer = false;
var isUnifiedEnabled = gs.getProperty('com.glide.par.unified_analytics.enabled', 'false');
if (isUnifiedEnabled == 'true') {
    answer = true;
}
