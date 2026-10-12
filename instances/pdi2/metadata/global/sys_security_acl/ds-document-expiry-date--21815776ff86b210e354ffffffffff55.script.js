(function() {

    if (current.isNewRecord())
        return true;

    var sec = new DocumentObjectSecurity();

    return sec._isOwner(current) ||
        sec.hasOwnerPermissionViaMTOM(current);
})();
