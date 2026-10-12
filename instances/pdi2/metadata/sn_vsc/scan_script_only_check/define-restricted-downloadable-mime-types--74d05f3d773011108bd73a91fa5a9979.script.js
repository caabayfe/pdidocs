 
      (function(finding) {
        var forceDownloadConfigured = gs.getProperty('glide.ui.attachment.force_download_all_mime_types', 'false');

        // Only bother with the check if force download is not configured.
        if (forceDownloadConfigured.toLowerCase() == "false") {
            var value_dict = {
                'text/html': '',
                'image/svg': '',
                'image/svg+xml': '',
                'application/xml': ''
            };
            var targetProperty = 'glide.ui.attachment.download_mime_types';
            var requiredValueList = JSON.parse(JSON.stringify(value_dict));
            var defaultValue = 'text/html,image/svg,image/svg+xml,application/xml';

            var rawValue = gs.getProperty(targetProperty, defaultValue);

            var valueArray = rawValue.split(',');
            for (var i = 0; i < valueArray.length; i++) {
                var current = valueArray[i];
                if (requiredValueList.hasOwnProperty(current))
                    delete requiredValueList[current];
            }

            if (Object.keys(requiredValueList).length != 0) {
                var gr = new GlideRecord('sys_properties');
                gr.get('name', targetProperty);
                finding.setCurrentSource(gr);
                finding.increment();
            }
        }
      })(finding);
