function onAfter(current, previous) {
   GlideCacheManager.prefixFlush("syscache_user_label", gs.getUserID());
}
