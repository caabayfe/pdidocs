const ThirdPartyExtensionsUtil = Class.create();
ThirdPartyExtensionsUtil.prototype = {
  initialize: function() {},

  /**
   * Returns a stringified array of active sn_glider_ide_extension records.
   * Each entry is enriched, when possible, with the extension's parsed
   * package.json (packageJSON) + package.nls.json (packageNLS) and a VS Code
   * extensionPath, so the manifests can be inlined into the page and consumed by
   * BuiltinExtensionsScannerService WITHOUT per-extension network round-trips.
   *
   *   [ { path, version, extensionPath?, packageJSON?, packageNLS? }, ... ]
   *
   * If a manifest cannot be read, packageJSON/packageNLS/extensionPath are
   * omitted and the extension falls back to the runtime-fetch path
   * (additionalBuiltinExtensions in the workbench web configuration).
   */
  getExtensions: function () {
    var result = [];
    try {
      var gr = new GlideRecord('sn_glider_ide_extension');
      gr.addQuery('active', true);
      gr.query();
      while (gr.next()) {
        var path = gr.getValue('path');
        var entry = {
          path: path,
          version: gr.getValue('version')
        };

        var packageJSON = null;
        var packageNLS = null;

        var dbPackageJSON = gr.getValue('package_json');
        var dbPackageNLS = gr.getValue('package_nls_json');
        if (dbPackageJSON && dbPackageNLS) {
          try {
            packageJSON = JSON.parse(dbPackageJSON);
            packageNLS = JSON.parse(dbPackageNLS);
          } catch (parseErr) {
            gs.warn('[ThirdPartyExtensionsUtil] Failed to parse stored manifest for ' + path + ': ' + parseErr);
            packageJSON = null;
            packageNLS = null;
          }
        }

        if (!packageJSON || !packageNLS) {
          packageJSON = this._readManifest(path, 'package.json');
          packageNLS = packageJSON ? this._readManifest(path, 'package.nls.json') : null;
        }

        if (packageJSON && packageNLS) {
          entry.extensionPath = this._toExtensionPath(path);
          entry.packageJSON = packageJSON;
          entry.packageNLS = packageNLS;
        }

        result.push(entry);
      }
    } catch (e) {
      // Never let an unexpected failure escape into the Jelly render and break
      // the page. Return whatever was collected (possibly empty); extensions
      // then simply fall back to the runtime-fetch path.
      gs.warn('[ThirdPartyExtensionsUtil] getExtensions failed: ' + e);
    }
    // Always return a valid JSON array string.
    return JSON.stringify(result);
  },

  /**
   * Derives the VS Code extensionPath (relative to the builtin extensions base
   * '/scripts/raw/sn_glider_app/extensions') from the stored absolute path, e.g.
   * '/scripts/raw/sn_glider_app/extensions/build-agent' -> 'build-agent'.
   */
  _toExtensionPath: function (path) {
    if (!path) {
      return path;
    }
    var marker = '/extensions/';
    var idx = path.indexOf(marker);
    return idx >= 0 ? path.substring(idx + marker.length) : path;
  },

  /**
   * Reads and parses a JSON manifest served under the extension path via an
   * internal HTTP GET (/scripts/raw/... static assets are served without auth).
   * Returns the parsed object, or null on any failure so callers can fall back.
   */
  _readManifest: function (basePath, fileName) {
    if (!basePath) {
      return null;
    }
    try {
      var base = '' + gs.getProperty('glide.servlet.uri');
      if (base.charAt(base.length - 1) === '/') {
        base = base.substring(0, base.length - 1);
      }
      var sep = basePath.charAt(0) === '/' ? '' : '/';
      var url = base + sep + basePath + '/' + fileName;

      var request = new sn_ws.RESTMessageV2();
      request.setEndpoint(url);
      request.setHttpMethod('get');
      request.setRequestHeader('Accept', 'application/json');
      var response = request.execute();
      if (response.getStatusCode() == 200) {
        return JSON.parse(response.getBody());
      }
      gs.warn('[ThirdPartyExtensionsUtil] ' + fileName + ' returned HTTP ' + response.getStatusCode() + ' for ' + url);
    } catch (e) {
      gs.warn('[ThirdPartyExtensionsUtil] Failed reading ' + fileName + ' for ' + basePath + ': ' + e);
    }
    return null;
  },

  // make this callable via GlideAjax
  type: 'ThirdPartyExtensionsUtil'
};
