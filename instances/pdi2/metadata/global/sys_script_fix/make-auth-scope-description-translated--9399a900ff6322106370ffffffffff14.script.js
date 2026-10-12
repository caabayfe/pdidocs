(function() {
    if (pm.isZboot())
        return;
    new TranslationUtils().convert("sys_auth_scope", ["description"]);
})();
