(function executeRule(current, previous /*null when async*/) {
var catalog = "jrobin_databases";
var key = current.name + "." + current.snc_mi;
GlideCacheManager.remove(catalog, key);
})(current, previous);
