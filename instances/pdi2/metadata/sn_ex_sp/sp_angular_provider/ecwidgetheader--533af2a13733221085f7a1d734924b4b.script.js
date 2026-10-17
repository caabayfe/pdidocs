function ecWidgetHeader() {
    return {
        restrict: 'E',
        replace: true,
        link: function(scope, elem, attrs) {
            var headingLevel = attrs.headingLevel || 'h4';
            var widgetId = attrs.widgetId;
            var widgetTitle = attrs.widgetTitle;
            var titleClass = attrs.titleClass || 'widget-title panel-title';
            
            var headingHtml = '<' + headingLevel + ' class="' + titleClass + '" id="' + 
                              widgetId + '-widget-title">' + widgetTitle + 
                              '</' + headingLevel + '>';
            
            elem.html(headingHtml);
        }
    };
}
