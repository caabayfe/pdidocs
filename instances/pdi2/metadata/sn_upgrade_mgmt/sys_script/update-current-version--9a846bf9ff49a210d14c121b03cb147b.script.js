(function executeRule(current, previous /*null when async*/ ) {

    // Add your code here
    function splitReleaseName(fileName) {
        if (!fileName || (fileName.indexOf('.war') === -1 && fileName.indexOf('.zip') === -1)) {
            return null;
        }

        var parts = fileName.split('__');

        var meta = parts[0]; // e.g. glide-xanadu-07-02-2024 or glide-trackadminx-11-12-2021
        var patchPart = parts[1] || ''; // patch1-hotfix2-... or missing

        var metaParts = meta.split('-');
        if (metaParts.length < 2) return null;

        var family = capitalize(metaParts[1]);
        if (!family) return null;

        if (patchPart.indexOf('patchrtp') === 0) {
            return family + ' RTP';
        }

        var match = patchPart.match(/(patch\d+[a-z]?)(-hotfix\d+[a-z]?)?/i);
        if (match) {
            var patchLabel = match[1]; // patch1, patch1a, etc.
            var hotfixLabel = match[2] || ''; // -hotfix2a

            if (patchLabel === 'patch0' && !hotfixLabel) {
                return family; // Base version
            }

            var name = family;

            if (patchLabel !== 'patch0') {
                name += ' ' + (patchLabel.replace('patch', 'Patch '));
            }

            if (hotfixLabel) {
                name += ' ' + (hotfixLabel.replace('-hotfix', 'Hotfix '));
            }

            return name;
        }

        // If no patch part is present or doesn't match expected format
        return family;
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
    gs.info("BR for UPDATE CURRENT VERSION from Upgrade History is called.");
    var glideWar = gs.getProperty('glide.war');
    var releaseName = splitReleaseName(glideWar);

    var instanceId = gs.getProperty('instance_id');
    var gr = new GlideRecord('sn_um_instance_status');
    gr.addQuery('instance_id', instanceId);
    gr.query();
    if (gr.next()) {
        gs.info("Updating current_version to: " + releaseName);
        gr.setValue('current_version', releaseName);
        gr.update();
    }

})(current, previous);
