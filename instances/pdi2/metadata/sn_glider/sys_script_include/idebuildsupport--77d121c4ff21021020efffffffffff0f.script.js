var IDEBuildSupport = Class.create();
IDEBuildSupport.prototype = {
    initialize: function() {},
    /**
     * Get all files that belong to a scope
     */
    getAppFiles: function(scopeId, excludePaths) {
        // FIXME: This should use an FS api and not do direct table access
        var files = [];
        var gr = new GlideRecord('sn_glider_ide_file_index');
        var root = 'now-file:/' + scopeId;
        gr.addQuery('uri', 'STARTSWITH', root + '/');
        gr.addQuery('type', 'file');
        gr.addNullQuery('dtime');
        if (excludePaths) {
            for (var i = 0; i < excludePaths.length; i++) {
                gr.addQuery('uri', 'DOES NOT CONTAIN', excludePaths[i]);
            }
        }
        gr.query();
        while (gr.next()) {
            var uri = gr.getValue('uri');
            var filename = uri.replace(root, '');
            var contentRecord = gr.content.getRefRecord();
            var content = gs.base64Decode(contentRecord.getValue('content') || '');
            var file = {
                'filename': filename,
                'content': content || ''
            };
            files.push(file);
        }
        return files;
    },
    /**
     * Get a package.json from a scope
     */
    getPackageJson: function(scopeId) {
        // FIXME: This should use an FS API and not do direct table access
        var gr = new GlideRecord('sn_glider_ide_file_index');
        var uri = 'now-file:/' + scopeId + '/package.json';
        gr.addQuery('type', 'file');
        gr.addNullQuery('dtime');
        gr.addQuery('uri', uri);
        gr.query();
        if (gr.next()) {
            var contentRecord = gr.content.getRefRecord();
            var content = gs.base64Decode(contentRecord.getValue('content') || '');
            return JSON.parse(content);
        }
    },
    /**
     * Get the scope name using a scope id
     */
    getScopeNameFromId: function(scopeId) {
        var gr = new GlideRecord('sys_scope');
        gr.get(scopeId);
        return gr.getValue('scope');
    },
    /**
     * Gets installed server dependencies on instance from package.json#dependencies
     */
    getInstalledDependenciesFromPackageJson: function(scopeId, packageJson) {
        var installedDependencies = [];
        if (!packageJson) return installedDependencies;
        var scopeName = this.getScopeNameFromId(scopeId);

        var moduleResolver = new sn_ide.IDEModuleResolver();

        var dependencies = packageJson.dependencies || {};
        var depKeys = Object.keys(dependencies);
        // Check if each dependency@version is installed on instance
        for (var i = 0; i < depKeys.length; i++) {
            var name = depKeys[i];
            var version = dependencies[name];
            // if the dependency is installed add it to the list
            if (moduleResolver.isPackageInstalled(scopeName, name, version)) {
                installedDependencies.push({
                    'name': name,
                    'version': version
                });
            }
        }
        return installedDependencies;
    },
    /**
     * Gets NowUI dependency types from package.json#nowUiDependencies
     */
    getNowUiDependencyTypesFromPackageJson: function(scopeId, packageJson) {
        var nowUiDependencyTypeList = [];
        if (!packageJson) return nowUiDependencyTypeList;
        var nowUiDependencies = packageJson.optionalDependencies || {};
        var depKeys = Object.keys(nowUiDependencies);
        for (var i = 0; i < depKeys.length; i++) {
            var pkgName = depKeys[i];
            // Get each dependency type and add it to the list
            // FIXME: This query looks like it'll be problematic and slow on a large dataset
            var type = this.getNowUiDependencyType(pkgName);
            nowUiDependencyTypeList.push({
                'name': pkgName,
                'type': type
            });
        }
        return nowUiDependencyTypeList;
    },
    getInstalledNodeModules: function(scopeId) {
        const gr = new GlideRecord('sn_glider_ide_file_index');
        gr.addQuery('type', 'file');
        gr.addNullQuery('dtime');
        gr.addQuery('uri', 'STARTSWITH', `now-file:/${scopeId}/node_modules`);
        gr.addQuery('uri', 'ENDSWITH', 'package.json');
        gr.query();
        const installedDeps = [];
        while (gr.next()) {
            const contentRecord = gr.content.getRefRecord();
            const content = gs.base64Decode(contentRecord.getValue('content') || '');
            const json = JSON.parse(content);
            if (!json) continue;
            const {
                name,
                version
            } = json;
            if (!(name && version)) continue;
            installedDeps.push({
                name,
                version
            });
        }
        return installedDeps;
    },
    /**
     * Retrieves the NowUI dependency type (component/library/primary) for a given package name.
     */
    getNowUiDependencyType: function(pkgName) {
        // If it's in sys_ux_lib_source_script, it's a component only
        var srcScriptGr = new GlideRecord('sys_ux_lib_source_script');
        srcScriptGr.addQuery('name', pkgName);
        srcScriptGr.setLimit(1);
        srcScriptGr.query();
        if (srcScriptGr.next())
            return 'component';

        // If it's sys_ux_lib_asset we have to check its type
        var uxAssetGr = new GlideRecord('sys_ux_lib_asset');
        uxAssetGr.addQuery('name', 'STARTSWITH', pkgName + '/');
        uxAssetGr.addQuery('name', 'ENDSWITH', '/index');
        uxAssetGr.addQuery('category', '!=', 'test_driver');
        uxAssetGr.addQuery('category', '!=', 'source_map');
        uxAssetGr.setLimit(1);
        uxAssetGr.query();
        if (uxAssetGr.next())
            return uxAssetGr.getValue('category');
    },
    /**
     * Install app metadata from a multipart response
     */
    installAppFromMultipart: function(multipartParser, scopeId) {
        var installer = new sn_ide.IDEZipInstaller(multipartParser);
        if (scopeId) installer.setAppId(scopeId);
        return installer.installZipFile();
    },
    /**
     * Get an input stream of all application metadata
     */
    getAppMetadataInputStream: function(scopeId, lastPull) {
        var appPackager = new sn_ide.IDEAppPackager(scopeId, lastPull);
        return appPackager.getInputStream();
    },
    /**
     * Instantiate a multipart builder
     */
    getMultipartBuilder: function() {
        return new sn_ide.IDEMultipartBuilder();
    },
    /**
     * Update or insert source files from a json array
     */
    updateOrInsertSourceFromJson(scopeId, files) {
        var syncUtil = new sn_glider.SyncUtil();
        var digest = new GlideDigest();
        if (!files) return;
        for (var x = 0; x < files.length; x++) {
            var file = files[x];
            if (!file.filename) throw new Error('Could not insert/update file, filename is missing!');
            if (!file.type) throw new Error('Could not insert/update file, file type is missing! ' + file.filename);
            var gr = new GlideRecord('sn_glider_ide_file_index');
            var slashFileName = file.filename.startsWith('/') ? file.filename : '/' + file.filename;
            var uri = 'now-file:/' + scopeId + slashFileName;
            var checksum = digest.getSHA1Hex(file.content || '').toLowerCase();
            var fileUpdate = {
                'uri': uri,
                'size': (file.content || '').length,
                'checksum': checksum,
                'type': file.type,
                'mtime': new Date().getTime(),
                'dtime': ''
            };
            var fileContent = {
                content: gs.base64Encode(file.content || ''),
                checksum: checksum
            };
            syncUtil.writeFile(fileUpdate, fileContent);
        }
    },
    validatePackageName(pkgName) {
        var PKG_REGEX = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;
        return PKG_REGEX.test(pkgName);
    },
    /**
     * Gets the count of source files in an application
     * @param {string} scopeId - The application scope sys_id
     * @param {Array<string>} excludePaths - An array of paths to exclude from the count
     * @returns {Number} The count of files in the scope
     */
    getAppSourceFileCount(scopeId, excludePaths) {
        const root = 'now-file:/' + scopeId;
        const ga = new GlideAggregate('sn_glider_ide_file_index');
        ga.addAggregate('COUNT');
        ga.addQuery('uri', 'STARTSWITH', root + '/');
        ga.addQuery('type', 'file');
        ga.addNullQuery('dtime');
        if (excludePaths) {
            for (let path of excludePaths) {
                ga.addQuery('uri', 'DOES NOT CONTAIN', path);
            }
        }

        ga.query();

        if (ga.next()) {
            return ga.getAggregate('COUNT');
        }

        return 0;
    },
    type: 'IDEBuildSupport'
};
