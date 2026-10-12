function transform() {
    var grS = new GlideAggregate('sys_service');
    if (grS.isValid()) {
        grS.addQuery('name', 'AISearch');
        if (grS.getCount() > 0)
            return true;
        else
            return new sn_ais.InfrastructureApi().requestAis();
    }
    return false;
}
