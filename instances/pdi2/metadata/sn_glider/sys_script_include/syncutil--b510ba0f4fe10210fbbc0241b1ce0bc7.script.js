var SyncUtil = Class.create();
SyncUtil.prototype = {
    initialize: function() {
        this.FILE_CONTENT_TABLE = 'sn_glider_ide_file_content';
        this.FILE_INDEX_TABLE = 'sn_glider_ide_file_index';
        this.CHECKSUM = 'checksum';
        this.URI = 'uri';
        this.TYPE = 'type';
        this.SIZE = 'size';
        this.CTIME = 'ctime';
        this.DTIME = 'dtime';
        this.MTIME = 'mtime';
        this.CONTENT = 'content';
        this.FILE = 'file';
        this.DIRECTORY = 'directory';
        this.NEGATIVE_INDEX = '-1';
        this.MODE = 'mode';
        this.IGNORE_PATHS_SYS_PROP = 'sn_glider.sync.remote.ignore_paths';

        // Messages
        this.REQUEST_BODY_EMPTY = 'Request body is empty';
    },

    _getIgnorePaths: function() {
        var ignorePathsStr = gs.getProperty(this.IGNORE_PATHS_SYS_PROP, '/node_modules/');
        // Clear ignore paths and disregard the default
        if (ignorePathsStr === '*NULL*') {
            return [];
        }
        var list = ignorePathsStr.split(',');
        var ignorePathsList = [];
        for (var listIndex = 0; listIndex < list.length; listIndex++) {
            // Filter empty values;
            if (list[listIndex]) {
                ignorePathsList.push(list[listIndex]);
            }
        }
        return ignorePathsList;
    },

    readDataFromRequestBody: function(requestBody) {
        if (gs.nil(requestBody) || JSON.stringify(requestBody) === '{}') {
            var info = new sn_ws_err.BadRequestError(this.REQUEST_BODY_EMPTY);
            return info;
        }

        return requestBody;
    },

    getFileStat: function(uri) {
        var gr = new GlideRecord(this.FILE_INDEX_TABLE);
        gr.addEncodedQuery(`${this.URI}=${uri}^${this.TYPE}=${this.FILE}^dtimeISEMPTY`);
        gr.query();

        var fsStat = {};

        if (gr.next()) {
            fsStat.file = this._getFileIndexObj(gr);

            var fileContentData = {};
            fileContentData.checksum = gr.content.checksum;
            fileContentData.content = gr.content.content;
            fsStat.content = fileContentData;
        }

        return fsStat;
    },

    getDirectoryStat: function(uri) {
        var files = [];
        var ignorePaths = this._getIgnorePaths();
        var gr = new GlideRecord(this.FILE_INDEX_TABLE);
        gr.addQuery(this.URI, 'STARTSWITH', uri);
        gr.addQuery(this.URI, '!=', uri);
        // Filter paths if configured
        if (ignorePaths && ignorePaths.length > 0) {
            for (var pathIndex = 0; pathIndex < ignorePaths.length; pathIndex++) {
                gr.addQuery(this.URI, 'DOES NOT CONTAIN', ignorePaths[pathIndex]);
            }
        }
        gr.query();

        while (gr.next()) {
            files.push(this._getFileIndexObj(gr));
        }

        return files;
    },

    getFileContentByURI: function(uri) {
        var gr = new GlideRecord(this.FILE_INDEX_TABLE);
        gr.addQuery(this.URI, uri);
        gr.query();

        if (gr.next()) {
            return gr.content.content;
        }

        return '';
    },

    getFileContentByChecksum: function(checksum) {
        var gr = new GlideRecord(this.FILE_CONTENT_TABLE);
        gr.addQuery(this.CHECKSUM, checksum);
        gr.query();

        if (gr.next()) {
            return gr.getValue(this.CONTENT);
        }

        return '';
    },

    _getFileIndexObj: function(gr) {
        var file = {};
        file.uri = gr.getValue(this.URI);
        file.type = gr.getValue(this.TYPE);
        file.checksum = gr.getValue(this.CHECKSUM);
        file.size = gr.getValue(this.SIZE);
        file.ctime = gr.getValue(this.CTIME);
        file.dtime = gr.getValue(this.DTIME);
        file.mtime = gr.getValue(this.MTIME);
        file.mode = gr.getValue(this.MODE)

        return file;
    },

    isDupeChecksum: function(fileContent) {
        // directories does not have checksum
        if (fileContent) {
            var gr = new GlideRecord(this.FILE_CONTENT_TABLE);
            gr.addQuery(this.CHECKSUM, fileContent.checksum);
            gr.query();

            return gr.getRowCount() > 0;
        }

        return false;
    },

    createFile: function(file, fileContent) {
        var newFileSysId = this.NEGATIVE_INDEX;
        var contentSysId = this.NEGATIVE_INDEX;

        if (fileContent && fileContent.checksum) {
            // Check if a content record with the same checksum already exists
            var existingContentRecord = this._getContentRecordByChecksum(fileContent.checksum);
            if (existingContentRecord) {
                // If it exists, use the sysId of the existing record
                contentSysId = existingContentRecord.sysId;
            } else {
                // If it doesn't exist, create a new content record
                var contentGR = new GlideRecord(this.FILE_CONTENT_TABLE);
                contentGR.initialize();
                contentGR.content = fileContent.content;
                contentGR.checksum = fileContent.checksum;
                contentSysId = contentGR.insert();
            }
        }

        // if ((file.type === this.FILE && contentSysId !== this.NEGATIVE_INDEX) || file.type === this.DIRECTORY) {
        var gr = new GlideRecord(this.FILE_INDEX_TABLE);
        gr.addEncodedQuery(`${this.URI}=${file.uri}`);
        gr.query();

        if (gr.next()) {
            // If a file record already exists, update the content reference and checksum
            gr.setValue('content', contentSysId !== this.NEGATIVE_INDEX ? contentSysId : '');
            gr.setValue('checksum', fileContent.checksum);
            gr.update();
        } else {
            // If a file record doesn't exist, create a new one
            if (!file.type) {
                gs.error('File/Dir cannot be created, ' + file.uri + ' has no type');
                return;
            }
            gr.initialize();
            gr.uri = file.uri;
            gr.type = file.type;
            gr.size = file.size;
            gr.ctime = file.ctime || this._getCurrentEpochTime();
            gr.checksum = file.checksum;
            gr.mode = file.mode;
            gr.dtime = file.dtime;
            gr.mtime = file.mtime;
            gr.content = contentSysId !== this.NEGATIVE_INDEX ? contentSysId : '';
            newFileSysId = gr.insert() || this.NEGATIVE_INDEX;
        }

        return newFileSysId;
    },

    writeFile: function(fileUpdate, fileContent) {
        var gr = new GlideRecord(this.FILE_INDEX_TABLE);
        gr.addQuery(this.URI, fileUpdate.uri);
        //gr.addEncodedQuery(`${this.URI}=${fileUpdate.uri}^dtimeISEMPTY`);
        gr.query();

        if (gr.next()) {
            if (fileContent && fileContent.checksum) {
                // Check if a content record with the same checksum already exists
                var existingContentRecord = this._getContentRecordByChecksum(fileContent.checksum);
                if (existingContentRecord) {
                    // If it exists, use the sysId of the existing record
                    gr.setValue('content', existingContentRecord.sysId);
                } else {
                    // If it doesn't exist, create a new content record and update the content reference
                    var contentGR = new GlideRecord(this.FILE_CONTENT_TABLE);
                    contentGR.initialize();
                    contentGR.content = fileContent.content;
                    contentGR.checksum = fileContent.checksum;
                    var contentSysId = contentGR.insert();
                    gr.setValue('content', contentSysId);
                }

                // Update the checksum
                gr.setValue('checksum', fileContent.checksum);
            } else if (fileContent && !fileContent.checksum) {
                gs.info(`[IDE][SyncUtil] Checksum value cannot be empty. content update for URI: ${fileUpdate.uri} is ignored.`);
            }

            gr.setValue('ctime', fileUpdate.ctime || this._getCurrentEpochTime());
            gr.setValue('mtime', fileUpdate.mtime || this._getCurrentEpochTime());
            gr.setValue('size', fileUpdate.size);
            gr.setValue('mode', fileUpdate.mode);
            gr.setValue('dtime', '');
            gr.update();
        } else {
            this.createFile(fileUpdate, fileContent);
        }
    },

    _getContentRecordByChecksum: function(checksum) {
        var gr = new GlideRecord(this.FILE_CONTENT_TABLE);
        gr.addQuery(this.CHECKSUM, checksum);
        gr.query();

        if (gr.next()) {
            return {
                sysId: gr.getUniqueValue(),
                content: gr.getValue(this.CONTENT),
                checksum: gr.getValue(this.CHECKSUM)
            };
        }

        return null;
    },

    addOrUpdateContent: function(sysId, content, checksum) {
        var gr = new GlideRecord(this.FILE_CONTENT_TABLE);
        var guid = sysId ? sysId : gs.generateGUID();
        gr.get(guid);
        // gr.setValue(this.CONTENT, content);
        // gr.setValue(this.CHECKSUM, checksum);
        gr.content = content;
        gr.checksum = checksum;
        gr.update();

        return guid;
    },

    updateContentRecord: function(sysId, content, checksum) {
        var gr = new GlideRecord(this.FILE_CONTENT_TABLE);
        var guid = sysId ? sysId : gs.generateGUID();
        gr.get(guid);
        // gr.setValue(this.CONTENT, content);
        // gr.setValue(this.CHECKSUM, checksum);
        gr.content = this.CONTENT;
        gr.checksum = this.CHECKSUM;
        gr.update();
    },

    addNewContentRecord: function(content, checksum) {
        var gr = new GlideRecord(this.FILE_CONTENT_TABLE);
        gr.get(sysId);
        gr.setValue(this.CONTENT, content);
        gr.setValue(this.CHECKSUM, checksum);
        gr.updateMultiple();
    },

    purgeData: function(file) {
        var response = {};
        var gr = new GlideRecord(this.FILE_INDEX_TABLE);
        gr.addEncodedQuery(`uriSTARTSWITH${file.uri}/^ORuri=${file.uri}`);
        gr.query();

        if (gr.getRowCount() === 0) {
            response.statusCode = 200;
            return response;
        }

        try {
            while (gr.next()) {
                var contentDeleted = true;

                if (gr.content) {
                    var grContent = gr.content.getRefRecord();

                    // Check if any records in sn_glider_ide_file_index have a reference to gr.content
                    var grFileIndex = new GlideRecord(this.FILE_INDEX_TABLE);
                    grFileIndex.addQuery('content', gr.content);
                    grFileIndex.addNullQuery('dtime');
                    grFileIndex.query();

                    // Only delete the content record if only one record in sn_glider_ide_file_index reference it
                    if (grFileIndex.getRowCount() === 1) {
                        contentDeleted = grContent.deleteRecord();
                    }
                }

                if (contentDeleted) {
                    // delete file record
                    //gr.deleteRecord();
                    gr.setValue('dtime', file.dtime);
                    gr.setValue('mtime', '');
                    gr.setValue('ctime', '');
                    // Hack
                    gr.setValue(this.CHECKSUM, '');
                    gr.setValue(this.CONTENT, '');
                    gr.update();
                }
            }
        } catch (err) {
            response.statusCode = 500;
            response.body = {
                status: err.message
            };
            return response;
        }

        return response.statusCode = 200;
    },

    _getCurrentEpochTime: function() {
        return new Date().getTime();
    },

    type: 'SyncUtil'
};
