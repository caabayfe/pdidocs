var FavoriteSecurityUtil;
(function() {

    FavoriteSecurityUtil = {
        canView: canView,
    };

    function canView(gr, isMobile) {
        //First check extension point
        var extensionPoints = new GlideScriptedExtensionPoint().getExtensions('sn_ex_sp.FavoriteSecurity');
        var extensionCanView = false;
        var validExtension = false;
        for (var i = 0; i < extensionPoints.length; ++i) {
            var point = extensionPoints[i];
            if (point.applies(gr)) {
                validExtension = true;
                if (point.canView(gr, isMobile)) {
                    extensionCanView = true;
                    break;
                }
            }
        }
        if (validExtension)
            return extensionCanView;

        return gr.canRead(); // If there is no extension point, check ACL
    }

})();
