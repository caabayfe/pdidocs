function transform() {
    var isFunnelCreationAllowed = new CAConfig().isFunnelCreationAllowed();
    return isFunnelCreationAllowed == "true" ? true : false;
}
