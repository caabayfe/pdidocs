function onLoad() {
    addAfterPageLoadedEvent(function() {
        if ($('kba-guidance-auth')) $('kba-guidance-auth').up().hide();
        if ($('kba-guidance-auth-header')) $('kba-guidance-auth-header').up().hide();
        if ($('kba-guidance-ident')) $('kba-guidance-ident').up().hide();
        if ($('kba-guidance-ident-header')) $('kba-guidance-ident-header').up().hide();
    });
};
