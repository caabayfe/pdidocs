(function(finding) {
    var pluginManager = new GlidePluginManager();
    if (pluginManager.isActive('sn_impact_common')) {
        var targetProperty = 'sn_impact_common.blacklist_tags_HTML_injection';
        var expectedValue = 'script,iframe,object,embed,form,onerror,onload,style,img,video,audio,source,button';
        var defaultValue = 'script,iframe,object,embed,form,onerror,onload,style,img,video,audio,source,button';
        var propertyValue = gs.getProperty(targetProperty, defaultValue);

        var expectedValueList = expectedValue.split(',');
        var propertyValueList = propertyValue.split(',');
        
        for (i = 0; i < propertyValueList.length; i++) {
            propertyValueList[i] = propertyValueList[i].toLowerCase();
        }

        // Ensure every value in expected value list is found in actual property value list, finding if a value is not found
        for (i = 0; i < expectedValueList.length; i++) {
            if (propertyValueList.indexOf(expectedValueList[i].toLowerCase()) == -1) {
                var gr = new GlideRecord('sys_properties');
                gr.get('name', targetProperty);
                finding.setCurrentSource(gr);
                finding.increment();
                break;
            }
        }
    }
})(finding);
