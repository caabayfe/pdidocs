(function executeRule(current, previous /*null when async*/) {

    var newUrlSuffix = current.getValue('url_suffix');
    var oldUrlSuffix = previous ? previous.getValue('url_suffix') : '';
    var newRegex = '^aiux\\/' + _escapeRegex(newUrlSuffix) + '(\\/.*)?$';
    var oldPathSegmentName = 'AIUX - ' + oldUrlSuffix;
    var newPathSegmentName = 'AIUX - ' + newUrlSuffix;

    // Strategy 1: Find path segment by old URL suffix name (new naming convention)
    var pathSegmentByName = new GlideRecord('sys_sg_universal_link_path_segment');
    pathSegmentByName.addQuery('name', oldPathSegmentName);
    pathSegmentByName.query();

    while (pathSegmentByName.next()) {
        _updatePathSegment(pathSegmentByName, newPathSegmentName, newRegex);
    }

    // Strategy 2: Find path segments by old regex pattern (for existing entries)
    if (oldUrlSuffix) {
        var oldRegex = '^aiux\\/' + _escapeRegex(oldUrlSuffix) + '(\\/.*)?$';
        var pathSegmentByRegex = new GlideRecord('sys_sg_universal_link_path_segment');
        pathSegmentByRegex.addQuery('path_segment_regex', oldRegex);
        pathSegmentByRegex.query();

        while (pathSegmentByRegex.next()) {
            _updatePathSegment(pathSegmentByRegex, newPathSegmentName, newRegex);
        }
    }

    function _updatePathSegment(pathSegmentGR, newName, newRegex) {
        var currentRegex = pathSegmentGR.getValue('path_segment_regex');
        var currentName = pathSegmentGR.getValue('name');
        var needsUpdate = false;

        if (currentRegex !== newRegex) {
            pathSegmentGR.setValue('path_segment_regex', newRegex);
            needsUpdate = true;
        }

        // Also update name if it follows AIUX naming convention
        if (currentName.indexOf('AIUX - ') === 0 && currentName !== newName) {
            pathSegmentGR.setValue('name', newName);
            needsUpdate = true;
        }

        if (needsUpdate) {
            if (pathSegmentGR.update()) {
                gs.info('AIUX Experience BR: Updated path segment "' + currentName + 
                        '" to name "' + newName + '" with regex "' + newRegex + '"');
            } else {
                gs.error('AIUX Experience BR: Failed to update path segment "' + currentName + '"');
            }
        }
    }

    function _escapeRegex(str) {
        if (!str) return '';
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

})(current, previous);
