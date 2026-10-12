function attachMate($scope, $uibModal, nowAttachmentHandler, documentHandler, spAttachmentUpload, $http, $rootScope, spUtil, spModal, $log, spAriaUtil, $document, $q) {
    var c = this;
    var g_form;
    $scope.errorMessages = [];
    $scope.attachmentHandler = new nowAttachmentHandler(setAttachments, appendError);
    $scope.attachmentHandler.getAttachmentList = function(action) {
        $http.post('/api/now/documents', {
                'sys_id': $scope.data.sys_id,
                table_name: $scope.data.table
            })
            .then(function(response) {
                var attachments = response.data.result.documents || [];
                $scope.filter = attachments.reduce(function(prev, curr) {
                    return prev + curr.sys_id + ',';
                }, 'sys_idIN');
                $scope.attachmentHandler.setAttachments(attachments);
                if ($scope.attachmentHandler.startedUploadingTimeout || $scope.attachmentHandler.errorTimeout) {
                    $scope.attachmentHandler.stopAllUploading();
                    $rootScope.$broadcast('board.uploading.end');
                }
            });
    };
    $scope.data.action = "";
    var isReadonlyMode = $scope.data.read_only;

    spUtil.recordWatch($scope, "ds_document", $scope.filter, function(response, data) {
        if (response.data.operation === 'delete') {
            $('#' + response.data.sys_id).hide().closest("li.attachment-box").hide();
            return;
        }
        // rename can handle refreshing the list by itself so we can skip calling getAttachmentList
        if ($scope.attachmentHandler.attachmentAction != 'renamed')
            $scope.attachmentHandler.getAttachmentList();
        if (response.data) {
            var options = {};
            options.operation = response.data.operation;
            options.filename = response.data.display_value;
            options.sys_id = $scope.data.sys_id;
            options.table = $scope.data.table;
            options.state = (response.data.record && response.data.record.state) ? response.data.record.state.value : "";
            //broadcast only if operation is update...we don't need insert and other record updates for now
            if (options.operation === "update" && options.state === "not_available")
                $rootScope.$broadcast("attachment.updated", options);
        }
    });

    $scope.attachmentHandler.downloadAttachment = function(document) {
        c.server.get({
            action: 'download',
            download_sys_id: document.sys_id
        }).then(function(response) {
            if (response.data.version_attachment) {
                var url = '/sys_attachment.do?sys_id=' + response.data.version_attachment;
                window.open(url, '_blank');
            } else {
                spUtil.addErrorMessage($scope.data.failedDownloadDocumentMsg);
            }
        });

    };

    $scope.$evalAsync(function() {
        $scope.attachmentHandler.getAttachmentList();
    });

    $scope.confirmDeleteAttachment = function(attachment) {
        var appendTo = $scope.data.appendToId ? $document.find('#' + $scope.data.appendToId) : null;
        spModal.confirm($scope.data.deleteDocumentMsg, appendTo).then(function() {
            c.server.get({
                action: 'delete',
                delete_sys_id: attachment.sys_id
            }).then(function(response) {
                document.getElementsByClassName('tooltip')[0].remove();
                spUtil.addTrivialMessage($scope.data.deleteMsg);
            });
        });
    };

    $scope.dropFiles = function(files) {
        if (!$scope.data.canDragAndDrop) {
            spUtil.addInfoMessage(data.noDragDropMsg);
            return;
        }
        $scope.uploadAttachments(files);
    };

    $scope.uploadAttachments = function(files) {

        var maxFileSize = $scope.data.maxAttachmentSize * 1024 * 1024; // 100MB
        var largeFiles = 0;
        var folders = 0;
        files.some(function(file) {
            if (file.type === 'directory') {
                folders++;
                return true;
            } else if (file.size > maxFileSize) {
                largeFiles++;
                return true;
            }
            return false;
        });
        if (folders) {
            spUtil.addErrorMessage($scope.data.folderNotSupportedMsg);
            return;
        }
        if (files.length > 10) {
            spUtil.addErrorMessage($scope.data.uploadFileLimitMessage);
            return;
        }
        if (largeFiles) {
            spUtil.addErrorMessage($scope.data.largeAttachmentMsg);
            return;
        }

        var documents = [];
        if (files.length === 1 && $scope.data.popup_before_upload === 'true') {


            var deregisterUIActionListener;
            // To set the name field in document record to dropped file name.
            var deregister = $rootScope.$on('spModel.gForm.rendered', function(e, data) {
                g_form = data;
                g_form.setValue('name', files[0].name);
                deregister();
            });

            spModal.open({
                title: $scope.data.uploadPopupTitle,
                widget: 'documents-form-widget',
                widgetInput: {
                    'table': 'ds_document',
                    'sys_id': -1,
                    'view': $scope.data.metadata_form_view,
                    'hideRelatedLists': true,
                    'disableUIActions': true
                },
                buttons: [{
                        label: $scope.data.cancelButtonTitle,
                        cancel: true
                    },
                    {
                        label: $scope.data.uploadButtonTitle,
                        upload: true,
                        primary: true
                    }
                ],
                onSubmit: function() {
                    var deferred = $q.defer();


                    // Listen for UI action complete for new document record creation complete.

                    if (!deregisterUIActionListener) {
                        deregisterUIActionListener = $scope.$on("spModel.uiActionComplete", function(evt, response, savedFormSysId) {
                            c.server.get({
                                action: 'addDocumentwithMetadata',
                                docSysId: response.sys_id
                            }).then(function(r) {
                                uploadAttachmentsToVersions(r);
                            }, function(e) {
                                spUtil.addErrorMessage($scope.data.docCreationNotComplete);
                            });
                            // Close the modal when UI action is success.
                            deferred.resolve({
                                status: '200'
                            });
                            deregisterUIActionListener();
                        });
                    }

                    // Execute global submit ui action on new record ('sysverb_update_and_stay' calls the DocumentAnalyticsAPI internally so we changed to global 'sysverb_insert')						
                    g_form.submit('sysverb_insert');
									
                    return deferred.promise;
                }
            }).then(function(data) {
                deregisterUIActionListener && deregisterUIActionListener();
            }, function(e) {
                deregisterUIActionListener && deregisterUIActionListener();
            });

        } else {

            files.forEach(function(file) {
                var formData = {};
                formData.name = file.name;
                documents.push(formData);
            });
            uploadAttachment(documents);
        }

        function uploadAttachment(documents) {
            c.server.get({
                action: 'addDocument',
                documents: documents
            }).then(function(r) {
                uploadAttachmentsToVersions(r);
            });
        }

        async function uploadAttachmentsToVersions(r) {
            const versions = r.data.versions;
            const length = versions.length;

            async function uploadNext(index) {
                if (index >= length) {
                    spUtil.addTrivialMessage($scope.data.uploadMsg);
                    return;
                }
                const file = [files[index]];
                $scope.attachmentHandler.setParams(
                    'ds_document_version',
                    versions[index],
                    1024 * 1024 * $scope.data.maxAttachmentSize
                );
                try {
                    await spAttachmentUpload.uploadAttachments($scope.attachmentHandler, file);
                    uploadNext(index + 1);
                } catch (error) {
                    console.error(`Upload failed: ${file[0].name}`, error);
                }
            }
            uploadNext(0);
        }
    };
    $scope.attachmentHandler.editAttachment = function(widgetInput) {

        widgetInput.table = 'ds_document';
        widgetInput.setSavePrimary = true;
        widgetInput.view = $scope.data.metadata_form_view;
        var options = {};
        var newScope, formWidgetScope;

        var widgetURL = spUtil.getWidgetURL('documents-form-widget');

        var deregister = $rootScope.$on('spModel.gForm.rendered', function(e, data) {
            g_form = data;
            //Show only versions related list as other features of DMS are not supported.
            g_form.hideRelatedLists();
            g_form.showRelatedList('ds_document_version');
        });
        $http.post(widgetURL, widgetInput).success(function(response) {
            options.widget = response.result;
            var modal = $uibModal.open({
                templateUrl: 'sp-modal.html',
                controller: spModalCtrl,
                size: options.size,
                appendTo: options.appendTo,
                backdrop: options.backdrop != undefined ? options.backdrop : true,
                keyboard: options.keyboard != undefined ? options.keyboard : true,
                resolve: {
                    options: function() {
                        return options;
                    }
                }
            });
        });

        function createAndAppendWidget(widget, widgetInput) {

            newScope && newScope.$destroy();
            newScope = $scope.$new();

            var widgetURL = spUtil.getWidgetURL(widget);
            $http.post(widgetURL, widgetInput).success(function(response) {

                newScope.options.widget = response.result;
                document.querySelector(".modal-body [widget='widget']").remove();
                var elStr = "<sp-widget widget='options.widget'></sp-widget>";
                var divEle = angular.element(document.querySelector('.modal-body>div'));
                divEle.append(elStr);
                $compile(divEle)(newScope);
            });
        }

        function spModalCtrl($scope, options, $compile) {

            $scope.input = {
                value: options.value
            };
            $scope.options = options;
            $scope.form = {};

            $rootScope.$on('form.widget.scope.destroy', function(e, $scope) {
                formWidgetScope = $scope;
            });

            $scope.$on('modal.closing', function() {
                var pageRoot = angular.element('.sp-page-root');
                pageRoot.attr('aria-hidden', 'false');
                deregisterVersionEvent();
                deregisterNewversionEvent();
                deregisterDataTableEvent();
                deregisterFormBackClick();
                deregisterTableBackClick();
                formWidgetScope.$destroy();
                deregister();

            });
            $scope.clearFocusListCache = function() {
                $uibModalStack.clearFocusListCache();
            };
            var dataTableData;

            var deregisterTableBackClick = $rootScope.$on('datatable.widget.back.click', function(e, data) {
                createAndAppendWidget('documents-form-widget', widgetInput);
            });

            var deregisterFormBackClick = $rootScope.$on('form.widget.back.click', function(e, data) {
                createAndAppendWidget('documents-data-table', dataTableData);
            });

            var deregisterVersionEvent = $rootScope.$on('spModel.versions.clicked', function(e, data) {
                formWidgetScope.$destroy();
                data.filter = decodeURIComponent(data.filter);
                data.show_new = true;
                data.window_size = 5;
                data.fields = "version,type,url,notes";
                dataTableData = data;
                createAndAppendWidget('documents-data-table', data);
            });

            var deregisterNewversionEvent = $rootScope.$on('spModal.newversion.clicked', function(e, data) {
                var doc = data.query.replace('document=', '');
                data.prefilledFields = {
                    document: {
                        value: doc,
                        displayValue: widgetInput.file_name
                    }
                };
                data.show_back = true;
                createAndAppendWidget('documents-form-widget', data);
            });

            var deregisterDataTableEvent = $rootScope.$on('data_table.click', function(e, data) {
                data.show_back = true;
                createAndAppendWidget('documents-form-widget', data);
            });
        }
    };

    $scope.hasAttachments = function() {
        return $scope.attachments && $scope.attachments.length != 0;
    };

    $scope.canWrite = function() {
        return $scope.data.canWrite;
    };

    $scope.$on('dialog.upload_too_large.show', function(e) {
        $log.error($scope.data.largeAttachmentMsg);
        spUtil.addErrorMessage($scope.data.largeAttachmentMsg);
    });

    $scope.$on('added_attachment', function(evt) {
        $scope.data.action = "added";
        spUtil.update($scope);
    });

    $scope.$on('sn.attachment.scanned', function(evt) {
        $scope.attachmentHandler.getAttachmentList("list");
    });

    $scope.$on('sp.record.can_write', function(evt, answer) {
        $scope.data.canWrite = answer;
    });

    function appendError(error) {
        $scope.errorMessages.push(error);
        spUtil.addErrorMessage(error.msg + error.fileName);
        spAriaUtil.sendLiveMessage(error.msg);
    }

    function setAttachments(attachments, action) {
        if ($scope.submitting == true)
            return;

        if (isReadonlyMode) {
            attachments.forEach(function(attachment) {
                attachment.canDelete = false;
                attachment.canWrite = false;
            });
        }

        $scope.$evalAsync(function() {
            $scope.attachments = attachments;
        });

        if (!action)
            return;

        if (action === "added") {
            spAriaUtil.sendLiveMessage($scope.data.attachmentSuccessMsg);
        }
        if (action === "renamed") {
            spAriaUtil.sendLiveMessage($scope.data.renameSuccessMsg);
        }
        if (action === "deleted") {
            spAriaUtil.sendLiveMessage($scope.data.deleteSuccessMsg);
        }

        $scope.data.action = action;
        spUtil.update($scope);
    }

}
