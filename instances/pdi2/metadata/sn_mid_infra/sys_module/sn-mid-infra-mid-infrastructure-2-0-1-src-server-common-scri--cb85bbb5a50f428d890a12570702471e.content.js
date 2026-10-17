var UrlUtility = Class.create();
UrlUtility.prototype = {
    initialize: function() {
        this.INSTALL_BASE_URL = 'https://install.service-now.com/glide/distribution/builds/package';
        this.PROPERTY_MID_BUILDSTAMP   = 'mid.buildstamp';
        this.PROPERTY_GLIDE_BUILD_DATE = 'glide.builddate';
    },


    /**
     * @param {string} midName
     * @param {string} midUserSysId
     * @param {string} midRegKey
     * @param {string|null} packageType  - 'rpm' | 'deb' for Linux; null for Windows
     * @param {string} useProxy          - 'Y' | 'N'
     * @param {string} proxyHost
     * @param {string} proxyPort
     * @param {string} serviceName       - optional
     * @returns {string}  install command for the target platform
     */
    getInstallCmdForIPKI: function(midName, midUserSysId, midRegKey, packageType,
                                   useProxy, proxyHost, proxyPort,
                                   serviceName) {
        midName   = this._sanitize(midName);
        proxyHost = this._sanitize(proxyHost);
        proxyPort    = this._sanitize(proxyPort);
        serviceName  = this._sanitize(serviceName);

        var appName = serviceName || ('snc_mid_' + midName);

        if (packageType == null || packageType.length === 0) {
            return this._buildWindowsCmd([
                '-MidName "' + midName + '"',
                '-AuthType IPKI',
                '-RegistrationKey "' + midRegKey + '"',
                '-IpkiUser "' + midUserSysId + '"',
                '-ServiceName "' + appName + '"'
            ], useProxy, proxyHost, proxyPort);
        }

        return this._buildLinuxCmd([
            "--mid-name='" + midName + "'",
            '--auth-type=IPKI',
            "--registration-key='" + midRegKey + "'",
            "--ipki-user='" + midUserSysId + "'",
            "--app-name='" + appName + "'"
        ], packageType, useProxy, proxyHost, proxyPort);
    },

    // -------------------------------------------------------------------------

    _getInstanceUrl: function() {
        var url = gs.getProperty('glide.servlet.uri', '');
        return url.replace(/\/+$/, '');
    },

    /**
     * Returns the current buildstamp.
     * @returns {string}
     */
    _getBuildstamp: function() {
        return gs.getProperty(this.PROPERTY_MID_BUILDSTAMP, '');
    },

    /**
     * Parses the date path components from a glide.builddate value (MM-DD-YYYY_HHmm).
     * @param {string} buildDate  - e.g. '04-19-2026_2038'
     * @returns {{ month: string, day: string, year: string }|null}
     */
    _parseBuildDate: function(buildDate) {
        var match = buildDate.match(/^(\d{2})-(\d{2})-(\d{4})_\d{4}$/);
        if (!match) return null;
        return { month: match[1], day: match[2], year: match[3] };
    },

    /**
     * Constructs a versioned MID package download URL using glide.builddate for the date path.
     * URL format: {INSTALL_BASE_URL}/{pkgFolder}/{YYYY}/{MM}/{DD}/{filename}.{buildstamp}.{platform}.x86-64.{ext}
     * @param {string} pkgFolder  - e.g. 'mid-linux-installer'
     * @param {string} filename   - e.g. 'mid-linux-installer'
     * @param {string} platform   - e.g. 'linux' | 'windows'
     * @param {string} ext        - e.g. 'rpm' | 'deb' | 'msi'
     * @returns {string}
     */
    _getDownloadUrl: function(pkgFolder, filename, platform, ext) {
        var buildstamp = this._getBuildstamp();
        var date = this._parseBuildDate(gs.getProperty(this.PROPERTY_GLIDE_BUILD_DATE, ''));
        if (!date) return '';
        return this.INSTALL_BASE_URL + '/' + pkgFolder + '/' +
               date.year + '/' + date.month + '/' + date.day + '/' +
               filename + '.' + buildstamp + '.' + platform + '.x86-64.' + ext;
    },

    /**
     * Constructs the iPKI installer script download URL.
     * URL format: {INSTALL_BASE_URL}/{pkgFolder}/{YYYY}/{MM}/{DD}/{pkgFolder}.{buildstamp}.ipki-installer.{ext}
     * @param {string} pkgFolder  - e.g. 'mid-linux-installer' | 'mid-windows-installer'
     * @param {string} ext        - e.g. 'sh' | 'ps1'
     * @returns {string}
     */
    _getIpkiInstallerUrl: function(pkgFolder, ext) {
        var buildstamp = this._getBuildstamp();
        var date = this._parseBuildDate(gs.getProperty(this.PROPERTY_GLIDE_BUILD_DATE, ''));
        if (!date) return '';
        return this.INSTALL_BASE_URL + '/' + pkgFolder + '/' +
               date.year + '/' + date.month + '/' + date.day + '/' +
               pkgFolder + '.' + buildstamp + '.ipki-installer.' + ext;
    },

    _buildLinuxCmd: function(flags, packageType, useProxy, proxyHost, proxyPort) {
        var pkgUrl = (packageType === 'deb')
            ? this._getDownloadUrl('mid-linux-installer', 'mid-linux-installer', 'linux', 'deb')
            : this._getDownloadUrl('mid-linux-installer', 'mid-linux-installer', 'linux', 'rpm');
        var installerUrl = this._getIpkiInstallerUrl('mid-linux-installer', 'sh');
        var cmd = 'curl -sSL ' + installerUrl + ' -o ipki-installer.sh && sudo bash ipki-installer.sh';
        cmd += " --instance-url='" + this._getInstanceUrl() + "'";
        for (var i = 0; i < flags.length; i++) {
            cmd += ' ' + flags[i];
        }
        if (pkgUrl) {
            cmd += " --download-url='" + pkgUrl + "'";
        }
        cmd += this._linuxProxyFlags(useProxy, proxyHost, proxyPort);
        return cmd;
    },

    _buildWindowsCmd: function(flags, useProxy, proxyHost, proxyPort) {
        var installerUrl = this._getIpkiInstallerUrl('mid-windows-installer', 'ps1');
        var cmd = 'Invoke-WebRequest -Uri "' + installerUrl +
                  '" -OutFile ipki-installer.ps1; .\\ipki-installer.ps1';
        var winPkgUrl = this._getDownloadUrl('mid-windows-installer', 'mid-windows-installer', 'windows', 'msi');
        if (winPkgUrl) {
            cmd += ' -DownloadUrl "' + winPkgUrl + '"';
        }
        cmd += ' -InstanceUrl "' + this._getInstanceUrl() + '"';
        for (var i = 0; i < flags.length; i++) {
            cmd += ' ' + flags[i];
        }
        cmd += this._windowsProxyFlags(useProxy, proxyHost, proxyPort);
        return cmd;
    },

    _sanitize: function(value) {
        if (typeof value !== 'string') return '';
        return value.replace(/["'`$;&|\\()<>]/g, '');
    },

    _linuxProxyFlags: function(useProxy, proxyHost, proxyPort) {
        if (useProxy !== 'Y') {
            return ' --use-proxy=N';
        }
        var s = ' --use-proxy=Y';
        s += " --proxy-host='" + proxyHost + "'";
        s += " --proxy-port='" + proxyPort + "'";
        return s;
    },

    _windowsProxyFlags: function(useProxy, proxyHost, proxyPort) {
        if (useProxy !== 'Y') {
            return ' -UseProxy N';
        }
        var s = ' -UseProxy Y';
        s += ' -ProxyHost "' + proxyHost + '"';
        s += ' -ProxyPort "' + proxyPort + '"';
        return s;
    },

    type: 'UrlUtility'
};
