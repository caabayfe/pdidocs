var SyncUtilV2 = Class.create();
SyncUtilV2.prototype = {
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
        this.NOW_FILE_SCHEME = 'now-file';

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

    getFileStatQuery: function(uri) {
        var gr = new GlideRecord(this.FILE_INDEX_TABLE);
        gr.addEncodedQuery(`${this.URI}=${uri}^${this.TYPE}=${this.FILE}^dtimeISEMPTY`);
        gr.query();
        return gr;
    },

    getFileStat: function(uri) {
        var gr = this.getFileStatQuery(uri);
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

    getDirectoryStatQuery: function(uri) {
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
        return gr;
    },

    getDirectoryStat: function(uri) {
        var files = [];

        var gr = this.getDirectoryStatQuery(uri);
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
        file.mode = gr.getValue(this.MODE);

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
                contentSysId = this.writeContent(fileContent);
            }
        }

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
                    var contentSysId = this.writeContent(fileContent);
                    gr.setValue('content', contentSysId);
                }

                // Update the checksum
                gr.setValue('checksum', fileContent.checksum);
            } else if (fileContent && !fileContent.checksum) {
                gs.info(`[IDE][SyncUtilV2] Checksum value cannot be empty. content update for URI: ${fileUpdate.uri} is ignored.`);
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

    writeContent(fileContent) {
        var contentGR = new GlideRecord(this.FILE_CONTENT_TABLE);
        contentGR.initialize();
        contentGR.checksum = fileContent.checksum;
        if (!fileContent.contentStream) {
            contentGR.content = fileContent.content;
            var contentSysId = contentGR.insert();
            return contentSysId;
        } else if (!fileContent.content && fileContent.contentStream) {
            contentGR.content = "";
            var contentSysId = contentGR.insert();
            var gsa = new GlideSysAttachment();
            gsa.writeContentStream(contentGR, fileContent.checksum, 'application/octect-stream', fileContent.contentStream);
            return contentSysId;
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
        gr.content = content;
        gr.checksum = checksum;
        gr.update();

        return guid;
    },

    updateContentRecord: function(sysId, content, checksum) {
        var gr = new GlideRecord(this.FILE_CONTENT_TABLE);
        var guid = sysId ? sysId : gs.generateGUID();
        gr.get(guid);
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

    resetApplication: function(scopeSysId) {
        const scopeRootFile = {
            uri: `${this.NOW_FILE_SCHEME}:/${scopeSysId}`,
            dtime: this._getCurrentEpochTime()
        };
        const syncEndpointVersion = gs.getProperty('sn_glider.sync.remote.use_endpoint_version', 2);
        const syncUtil = parseInt(syncEndpointVersion) === 2 ? this : new sn_glider.SyncUtil();
        syncUtil.purgeData(scopeRootFile);
    },

    purgeData: function(file) {
        const start = new Date();
        const gr = new GlideRecord(this.FILE_INDEX_TABLE);
        gr.addEncodedQuery(`dtime=NULL^uriSTARTSWITH${file.uri}/^ORuri=${file.uri}`);
        gr.query();

        const rowCount = gr.getRowCount();

        if (rowCount === 0) {
            return;
        }

        let contentDeletedCount = 0;
        let fileRecordsUpdatedCount = 0;

        try {
            const contentIdsToDeleteSet = new Set();
            const fileIndexIdsToUpdate = [];
            while (gr.next()) {
                const contentId = gr.content.toString();
                if (contentId) {
                    contentIdsToDeleteSet.add(contentId);
                }
                fileIndexIdsToUpdate.push(gr.getUniqueValue());
            }

            if (contentIdsToDeleteSet.size > 0) {
                // Find other files referring to the content being deleted
                const ga = new GlideAggregate(this.FILE_INDEX_TABLE);
                ga.addQuery('content', 'IN', Array.from(contentIdsToDeleteSet));
                ga.addQuery('sys_id', 'NOT IN', fileIndexIdsToUpdate);
                ga.addAggregate('COUNT', 'content');
                ga.groupBy('content');
                ga.query();

                while (ga.next()) {
                    const contentId = ga.getValue('content');
                    const count = ga.getAggregate('COUNT', 'content');
                    if (parseInt(count, 10) > 0) {
                        // As some other file is referring this content, we should not delete it
                        contentIdsToDeleteSet.delete(contentId);
                    }
                }
                const contentIdsToDelete = Array.from(contentIdsToDeleteSet);
                const contentDeleteBatchSize = 1000;
                let contentIdIndex = 0;
                while (contentIdIndex < contentIdsToDelete.length) {
                    const batch = contentIdsToDelete.slice(
                        contentIdIndex,
                        contentIdIndex + contentDeleteBatchSize
                    );
                    contentIdIndex += contentDeleteBatchSize;

                    const fileContentRecordsToDelete = new GlideRecord(this.FILE_CONTENT_TABLE);
                    fileContentRecordsToDelete.addQuery('sys_id', "IN", batch);
                    fileContentRecordsToDelete.deleteMultiple();
                    contentDeletedCount += batch.length;
                }
            }

            const fileUpdateBatchSize = 1000;
            let fileIdIndex = 0;
            while (fileIdIndex < fileIndexIdsToUpdate.length) {
                const batch = fileIndexIdsToUpdate.slice(
                    fileIdIndex,
                    fileIdIndex + fileUpdateBatchSize
                );
                fileIdIndex += fileUpdateBatchSize;

                const grUpdate = new GlideRecord(this.FILE_INDEX_TABLE);
                grUpdate.addQuery('sys_id', 'IN', batch);
                grUpdate.setValue('dtime', file.dtime);
                grUpdate.setValue('mtime', '');
                grUpdate.setValue('ctime', '');
                // Hack
                grUpdate.setValue(this.CHECKSUM, '');
                grUpdate.setValue(this.CONTENT, '');
                grUpdate.updateMultiple();

                fileRecordsUpdatedCount += batch.length;
            }

            const end = new Date();
            if (gs.getProperty('sn_glider.sync.log_purge_execution_time', 'true') === 'true') {
                gs.info('[IDE] Purge:\nFile records scanned: {0}\nFile records updated: {1}\nContent records deleted: {2}\nTotal time: {3} seconds', rowCount, fileRecordsUpdatedCount, contentDeletedCount, (end - start) / 1000);
            }
        } catch (err) {
            gs.error('[IDE] Unable to completely delete ' + file.uri, err);
        }
    },

    _getCurrentEpochTime: function() {
        return new Date().getTime();
    },

    type: 'SyncUtilV2'
};
