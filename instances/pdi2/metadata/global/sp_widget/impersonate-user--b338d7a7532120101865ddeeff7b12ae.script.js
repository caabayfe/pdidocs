(function() {
    /* populate the 'data' object */
    /* e.g., data.table = $sp.getValue('table'); */
    data.isImpersonating = new GlideImpersonate().isImpersonating();
    data.realUser = gs.getImpersonatingUserName();
	data.realUserDisplayName = gs.getImpersonatingUserDisplayName();
})();
