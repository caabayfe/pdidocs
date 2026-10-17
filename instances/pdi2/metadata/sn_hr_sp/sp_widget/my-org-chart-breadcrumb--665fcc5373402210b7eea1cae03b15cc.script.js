(function() {
    data.breadcrumbsWidget = $sp.getWidget('breadcrumbs');

    data.breadcrumbs = [{
        label: gs.getMessage("My Org Chart"),
        url: ''
    }];

    if (input && input.previousTrail && input.previousTrail) {
        var gr = new GlideRecord('sp_page');
        gr.addQuery('id', input.previousTrail);
        gr.setLimit(1);
        gr.query();

        if (gr.hasNext()) {
            gr.next();
            data.breadcrumbs.unshift({
                label: gr.getDisplayValue('title'),
                url: '?id=' + input.previousTrail
            });
        }
    }

})();
