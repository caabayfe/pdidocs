var installing = false;

if (current.name == 'glide.sys.domain.paths') {
    var installed = GlidePropertiesDB.get("glide.sys.domain.paths.installed");
    if (installed == null || installed == 'false') {
        var provider = new GlideDomainPathProvider();
        provider.install(true);
        installing = true;
    } else
        GlidePropertiesDB.set("glide.sys.domain.numbering", 'false');
}

if (current.name == 'glide.sys.domain.numbering') {
    var installed = GlidePropertiesDB.get("glide.sys.domain.numbers.installed");
    if (installed == null || installed == 'false') {
        var provider = new GlideDomainNumberProvider();
        provider.install(true);
        installing = true;
    } else
        GlidePropertiesDB.set("glide.sys.domain.paths", 'false');
}

if (installing) {
    gs.addErrorMessage(gs.getMessage('That support method for domain is not installed yet, installation is now in progress and the method will be automatically enabled once completed'));
    current.setAbortAction(true);
}
