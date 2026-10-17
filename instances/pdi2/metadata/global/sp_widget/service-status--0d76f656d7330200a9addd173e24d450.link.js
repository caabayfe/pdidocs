function(scope, elem) {
    var setFocusItem = function(item) {
        $(elem).find("div[data-toggle='tooltip']").attr('tabindex', '-1');
        item.attr('tabindex', '0');
        item.focus();
    };
    $(elem).on('focus blur', "div[data-toggle='tooltip']", function(e) {
        if (e.originalEvent.type === 'focus')
            $(e.target).addClass('active');
        else
            $(e.target).removeClass('active');
    });
    $(elem).on('keydown', 'ul li div', function(e) {
        var target = e.target;
        var allToolTips = $(elem).find("div[data-toggle='tooltip']");
        var firstToolTip = allToolTips.first();
        var lastToolTip = allToolTips.last();
        var isLeftRightArrowKey = false;
        var toolTipItemToFocus;
        if (e.keyCode == 37) {
            isLeftRightArrowKey = true;
            var previousDay = $(target).parent().prevAll('li').first();
            var previousToolTip = previousDay.find("[data-toggle='tooltip']");
            //enable circular navigation
            toolTipItemToFocus = previousToolTip.length ? previousToolTip : lastToolTip;
        } else if (e.keyCode == 39) {
            isLeftRightArrowKey = true;
            var nextDay = $(target).parent().nextAll('li').first();
            var nextToolTip = nextDay.find("[data-toggle='tooltip']");
            //enable circular navigation
            toolTipItemToFocus = nextToolTip.length ? nextToolTip : firstToolTip;
        }
        if (isLeftRightArrowKey) {
            e.preventDefault();
            $(target).removeClass('active');
            setFocusItem(toolTipItemToFocus);
        }
    });

}
