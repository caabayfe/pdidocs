/**
 * Resolves the release_version value that is sent to the CDS server, derived from
 * the instance build information.
 *
 * Source precedence:
 *   1. glide.buildtag - used when it carries a real release value, i.e. it looks
 *      like glide-<family>-MM-DD-YYYY... and is NOT a track build.
 *   2. sn_experiment_core.release_version property - manual fallback used
 *      only when the build tag is not a valid release build. The property is
 *      expected to use the SAME glide build-tag format and is parsed identically.
 *
 * The value is produced by pure string extraction from the build tag (there is no
 * experimentation_releases table lookup):
 *   glide-zurich-02-11-2026__patch3-05-25-2026        -> "Zurich Patch 3"
 *   glide-australia-02-11-2026__patch2-hotfix3a-...   -> "Australia Patch 2 Hot Fix 3a"
 *   glide-zurich-04-21-2026                            -> "Zurich" (family only, no patch)
 *
 * A track build (glide-trackcoreism-...) or a build with no release family
 * (glide-08-12-2026_1730) is treated as invalid and resolves to '' from the build
 * tag, which triggers the override-property fallback.
 */
var ReleaseVersionResolver = Class.create();
ReleaseVersionResolver.prototype = {
    initialize: function() {},

    resolveReleaseVersion: function() {
        return this._extractReleaseVersion(this._getBuildValue());
    },

    _getBuildValue: function() {
        var buildTag = gs.getProperty('glide.buildtag', '');
        if (this._isValidBuildTag(buildTag)) {
            return buildTag;
        }
        return gs.getProperty(CDSClientConstants.PROPERTY_RELEASE_VERSION, '');
    },

    _isValidBuildTag: function(buildTag) {
        var match = buildTag && buildTag.match(/^glide-([a-zA-Z]+)-\d{2}-\d{2}-\d{4}/i);
        return !!(match && !/^track/i.test(match[1]));
    },

    _extractReleaseVersion: function(buildValue) {
        if (!buildValue) {
            return '';
        }

        var match = buildValue.match(/glide-([a-zA-Z]+)-\d{2}-\d{2}-\d{4}(?:[-_]+patch(\d+(?:(?!w)[a-zA-Z])?)(?:[-_]+hotfix(\d+(?:(?!w)[a-zA-Z])?))?)?/i);
        if (!match || /^track/i.test(match[1])) {
            return '';
        }

        var releaseVersion = this._capitalize(match[1]);
        if (match[2]) {
            releaseVersion += ' Patch ' + match[2];

            if (match[3]) {
                releaseVersion += ' Hot Fix ' + match[3];
            }
        }

        // Optional weekly build token (e.g. -w34 / _w35), appended when present.
        var weekMatch = buildValue.match(/[-_]?w(\d+)(?=[-_]|$)/i);
        if (weekMatch) {
            releaseVersion += ' W' + weekMatch[1];
        }

        return releaseVersion;
    },

    _capitalize: function(value) {
        if (!value) {
            return '';
        }
        return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    },

    type: 'ReleaseVersionResolver'
};
