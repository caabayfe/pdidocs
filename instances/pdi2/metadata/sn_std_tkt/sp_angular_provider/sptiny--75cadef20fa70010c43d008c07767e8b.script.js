function(getTemplateUrl, snAttachmentHandler, $timeout, i18n, spAriaUtil, $rootScope, spUtil, $sce, $compile) {
    var templateString = 		'<div>'+
	'<script type="text/ng-template" id="/at-mentions.tpl">' +
    '<style>' +
    '.at-mention-dropdown {' +
     'min-width: 280px;' +
     'max-width: 400px;' +
     'max-height: 300px;' +
     'overflow-y: auto;' +
     'padding: 0;' +
     'margin: 2px 0 0;' +
     'border-radius: 4px;' +
     'box-shadow: 0 2px 8px rgba(0,0,0,0.15);' +
    '}' +
    '.at-mention-item {' +
     'padding: 8px 12px;' +
     'cursor: pointer;' +
     'display: block;' +
     'clear: both;' +
     'font-weight: normal;' +
     'line-height: 1.42857143;' +
     'white-space: nowrap;' +
     'border: none;' +
     'transition: background-color 0.15s ease-in-out;' +
    '}' +
    '.at-mention-item:hover {' +
     'background-color: rgba(0,0,0,0.05);' +
    '}' +
    '.at-mention-item:focus {' +
     'outline: none;' +
     'background-color: rgba(0,0,0,0.075);' +
    '}' +
    '.at-mention-item-content {' +
     'display: flex;' +
     'align-items: center;' +
     'gap: 10px;' +
     'width: 100%;' +
    '}' +
    '.at-mention-user-info {' +
     'display: flex;' +
     'flex-direction: column;' +
     'min-width: 0;' +
     'flex: 1;' +
    '}' +
    '.at-mention-user-name {' +
     'overflow: hidden;' +
     'text-overflow: ellipsis;' +
     'white-space: nowrap;' +
    '}' +
    '.at-mention-empty,' +
    '.at-mention-loading,' +
    '.at-mention-prompt {' +
     'padding: 12px;' +
     'text-align: center;' +
     'color: inherit;' +
     'opacity: 0.7;' +
    '}' +
    '.at-mention-loading .icon-loading {' +
     'margin-right: 8px;' +
    '}' +
    '/* Dark theme support */' +
    'body.dark-theme .at-mention-dropdown,' +
    '.sp-dark-theme .at-mention-dropdown {' +
     'box-shadow: 0 2px 8px rgba(0,0,0,0.4);' +
    '}' +
    'body.dark-theme .at-mention-item:hover,' +
    '.sp-dark-theme .at-mention-item:hover {' +
     'background-color: rgba(255,255,255,0.1);' +
    '}' +
    'body.dark-theme .at-mention-item:focus,' +
    '.sp-dark-theme .at-mention-item:focus {' +
     'background-color: rgba(255,255,255,0.15);' +
    '}' +
    '</style>' +
    '<div>'+
    '<ul ng-if="items.length===1 &amp;&amp; items[0].termLengthIsZero" class="dropdown-menu at-mention-dropdown" style="display:block;">'+
        '<li class="at-mention-prompt">'+
            '${Enter the Name of the person you want to mention}'+
        '</li>'+
    '</ul>' +
    '<ul ng-if="items.length === 0 &amp;&amp; items.loading &amp;&amp; visible" class="dropdown-menu at-mention-dropdown" style="display:block;">' +
        '<li class="at-mention-loading">' +
            '<span class="icon-loading"></span>' +
            '<span>${Loading...}</span>'+
        '</li>'+
    '</ul>' +
    '<ul ng-if="items.length>0 &amp;&amp; !items[0].termLengthIsZero" class="dropdown-menu at-mention-dropdown" style="display:block;">'+
        '<li mentio-menu-item="item" ng-repeat="item in items" class="at-mention-item">'+
            '<div class="at-mention-item-content">'+
                '<sn-avatar primary="item" show-presence="true"></sn-avatar>'+
                '<div class="at-mention-user-info">'+
                    '<span class="at-mention-user-name" ng-bind-html="item.name"></span>'+
                    '<span ng-if="!item.record_is_visible" class="text-muted" style="font-size: 0.9em;">${Cannot see record}</span>'+
                '</div>'+
            '</div>'+
        '</li>'+
    '</ul>'+
    '<ul ng-if="items.length===0 &amp;&amp; !items.loading" class="dropdown-menu at-mention-dropdown" style="display:block;">'+
        '<li class="at-mention-empty">'+
            '${No users found}'+
        '</li>'+
    '</ul>'+
    '</div>'+
        '</script>'+
				'<div ng-show="!field.isReadonly() &amp;&amp; !attrs.disabled">'+
					'<span ng-if="::accessibilityEnabled" role="note" data-toggle="tooltip" tabindex="0" class="fa fa-question-circle" '+
						'aria-label="${HTML:gs.getMessage(\'In the editor, press Alt+F10 to focus on the toolbar. Mac press Option+F10 to focus on the toolbar. Press escape to return to the editor.\')}" '+
						'title="${HTML:gs.getMessage(\'In the editor, press Alt+F10 to focus on the toolbar. Mac press Option+F10 to focus on the toolbar. Press escape to return to the editor.\')}">'+
					'</span>'+
					'<textarea ui-tinymce="tinyMCEOptions"'+
						'name="{{attrs.name}}"'+
						'label="{{attrs.name}}"'+
						'ng-model="model"'+
						'ng-model-options="options"'+
						'ng-change="onChangeModel()" rows="10" id="{{textareaId}}"'+
						'mentio=""'+
						'mentio-typed-term="typedTerm"'+
						'mentio-template-url="/at-mentions.tpl"'+
						'mentio-items="members"'+
						'mentio-search="searchMembersAsync(term)"'+
						'mentio-select="selectAtMention(item)"'+
						'mentio-iframe-element="iframeElement">'+
					'</textarea>'+
					'<input ng-file-select="attachFiles({files: $files})"'+
						'ng-click="$event.stopPropagation();"'+
						'tabindex="-1"'+
						'aria-hidden="true"'+
						'multiple=""'+
						'accept="image/jpeg,image/png,image/bmp,image/x-windows-bmp,image/gif,image/x-icon,image/svg+xml"'+
						'type="file"'+
						'style="display: none;">'+
					'</input>'+
				'</div>'+
				'<div ng-if="field.isReadonly() || attrs.disabled">'+
					'<div class="tinymce-html-content" ng-bind-html="::trustedHTML(model)"></div>'+
				'</div>'+
				'</div>';
    return {
        template: templateString,
        restrict: 'E',
        replace: true,
        scope: {
            // for paste to attachments, either glideForm or the recordTableName should be provided
            model: '=ngModel',
            field: '=?',
            options: '=ngModelOptions',
            snBlur: '&',
            snDisabled: '=?',
            getGlideForm: '&glideForm',
            ngChange: '&',
            attachmentGuid: '=?',
            recordTableName: '=?',
            textId: '@?',
            autoFocus: '@?',
            toolBar: '=?',
            mentions: '=?'
        },
        controller: function($scope, $element, $attrs, $sce, nowAttachmentHandler, $animate, $rootScope, cabrillo, $timeout, snRecordWatcher, spUtil, spAriaUtil, $http, $window, snAttachmentHandler, i18n, $sanitize, snMention) {
            var isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
            $scope.accessibilityEnabled = spAriaUtil.g_accessibility === "true";
            $scope.onChangeModel = function() {
                $timeout(function() {
                    $scope.ngChange();
                });
            }

            $scope.trustedHTML = function(html) {
                html = spUtil.sanitizeHtml(html);
                return $sce.trustAsHtml(html);
            };

            $scope.members = [];
            $scope.members.loading = true;

            function getMembersFromPageContext(members, term) {
                var globalMembers = NOW.recordMembers || {};
                var matching = [];
                var memberKeys = Object.keys(globalMembers);
                term = term.toLowerCase().trim();
                // find record members who match the term
                memberKeys.forEach(function(sysId) {
                    var member = globalMembers[sysId];
                    if ((typeof member.name !== "undefined" && member.name.toLowerCase().indexOf(term) == 0) || (typeof member.last_name !== "undefined" && member.last_name.toLowerCase().indexOf(term) == 0))
                        matching.push(member);
                });
                // append members from network, avoid duplicates
                members.forEach(function(member) {
                    if (memberKeys.indexOf(member.sys_id) == -1)
                        matching.push(member);
                });
                return matching;
            }


            //contains a map between a mentioned user and their sys_id
            // WARNING: This technique isn't going to work if you mention two different people with the
            //          same name in a single message.
            //key: User's name
            //value: sys_id
            var mentionMap = {};

            $scope.selectAtMention = function(item) {
                if (item.termLengthIsZero)
                    return (item.name || "") + "\n";

                mentionMap[item.name] = item.sys_id;
                $rootScope.$broadcast("mentionID", mentionMap);
                return "@[" + item.name + "]";

            };


            //Debouncing the name typing input so we aren't hammering the server with requests.
            var typingTimer;
			if ($scope.mentions) {
		         $scope.searchMembersAsync = function(term) {
		             $scope.members = getMembersFromPageContext([], term);
		             $scope.members.loading = true;
		             $timeout.cancel(typingTimer);
		             if (term.length === 0) {
		                 $scope.members = [{
		                     termLengthIsZero: true
		                 }];
		                 $scope.members.loading = false;
		             } else {
		                 typingTimer = $timeout(function() {
		                     snMention.retrieveMembers($scope.recordTableName, $scope.attachmentGuid, term).then(function(members) {
		                         $scope.members = getMembersFromPageContext(members, term);
		                         for (var k = 0; k < $scope.members.length; k++) {
		                             $scope.members[k].label = $scope.members[k].name;
		                         }
		                         $scope.members.loading = false;
		                     }, function() {
		                         $scope.members = getMembersFromPageContext([{
		                             termLengthIsZero: true
		                         }], term);
		                         $scope.members.loading = false;
		                     });
		                 }, 500);
		             }
		         }
			}

            $scope.options = $scope.options || {};
            var thisEditor = {};
            var g_form;
            var field;
            if (typeof $attrs.glideForm != "undefined") {
                g_form = $scope.getGlideForm();
            }

            if (typeof $attrs.field != "undefined") {
                field = $scope.field;
            }

            var guID = spUtil.generateUniqueID();
            $scope.textareaId = ($scope.textId ? $scope.textId.replace('.', '-') : 'ui-tinymce-') + guID;

            var tinyMceSettings = tinyMCE && tinyMCE.DOM && tinyMCE.DOM.settings;
            if (tinyMceSettings) {
                tinyMceSettings.lastTinyMceId = $scope.textareaId; // holds id of last rendered tinymce instance
                tinyMceSettings.onSetAttrib = function(args) {
                    var elem = $(args.attrElm);
                    if (args.attrName === 'src' && elem.is('iframe') && args.attrValue.indexOf('javascript') > -1)
                        elem.removeAttr('src');
                }
            }

            var langs = 'ar,cs,de,en,es,fi,fr,fq,he,hu,it,ja,ko,nb,nl,pb,pl,pt,ru,sv,th,tr,zh,zt';
            var userLanguage = g_lang;
            if (!userLanguage || langs.indexOf(userLanguage) == -1)
                userLanguage = g_system_lang;

            if (!userLanguage || langs.indexOf(userLanguage) == -1)
                userLanguage = 'en'; // if we don't have the language, fall back to english

            // Language strings that need to be converted for TinyMCE to load
            var languageMap = {
	    	ar: 'ar',
                pb: 'pt_BR',
                zh: 'zh_CN',
                fr: 'fr_FR',
                fq: 'fr_FR',
                he: 'he_IL',
                hu: 'hu_HU',
                ko: 'ko_KR',
                nb: 'nb_NO',
                pt: 'pt_PT',
                sv: 'sv_SE',
                th: 'th_TH',
                zt: 'zh_TW'
            };
            userLanguage = languageMap[userLanguage] || userLanguage;

            var modelWatcher;
            var updateModelWatcher = function(isReadOnly) {
                if ((isReadOnly || $attrs.disabled) && !modelWatcher) {
                    modelWatcher = $scope.$watch('model', function() {
                        if (!$element[0]) return;
                        var tinymcElement = $element[0].getElementsByClassName('tinymce-html-content');
                        if (tinymcElement) {
                            $compile(tinymcElement)($scope);
                        }
                    });
                } else if (!isReadOnly && !$attrs.disabled && modelWatcher) {
                    modelWatcher();
                    modelWatcher = null;
                }
            }

            var setMode = function() {
                var isReadOnly = false;
                var isMandatory = false;

                if ($scope.field) {
                    isReadOnly = g_form ? g_form.isReadOnly(field.name) : ($scope.field.sys_readonly || false);
                    isMandatory = $scope.field.isMandatory ? $scope.field.isMandatory() : ($scope.field.mandatory || false);
                }

                var body = thisEditor.getDoc().body;
                $timeout(function() {
                    updateModelWatcher(isReadOnly);
                    if ($scope.field) {
                        var fieldAriaLabel = isMandatory ? i18n.format(i18n.getMessage('{0}, required'), $scope.field.label) : $scope.field.label;
                        body.setAttribute('aria-label', fieldAriaLabel);
                    }
                }, 1000); // longer timeout interval will help with visually complete performance
            }

            var updateMode = function() {
                if (thisEditor.getDoc && thisEditor.getDoc() && thisEditor.getDoc().body) {
                    setMode();
                } else {
                    $timeout(updateMode, 10);
                }
            }

            var removeScriptHost = true;
            if (typeof g_tinymce_remove_script_host !== "undefined")
                removeScriptHost = g_tinymce_remove_script_host;

            var convertURLs = false;
            if (typeof g_tinymce_convert_urls !== "undefined")
                convertURLs = g_tinymce_convert_urls;

            var relativeURLs = true;
            if (typeof g_tinymce_relative_urls !== "undefined")
                relativeURLs = g_tinymce_relative_urls;

            function getTableAndSysId() {
                var result = {};
                var form = $scope.getGlideForm();
                if (form) {
                    var tableName = form.getTableName();
                    var sysId = form.getSysId();
                    if (tableName) {
                        result.table = tableName;
                        result.sys_id = sysId > -1 ? sysId : $scope.attachmentGuid;
                    } else {
                        result.table = form.recordTableName;
                        result.sys_id = $scope.attachmentGuid || sysId;
                    }
                } else {
                    result.table = $scope.recordTableName;
                    result.sys_id = $scope.attachmentGuid;
                }

                return result;
            }

            function getElementHeight(className, editorContainer) {
                var $target = editorContainer.getElementsByClassName(className);
                if ($target.length)
                    return $target[0].offsetHeight;
            }

            function getAdditionalHeights(editorContainer) {
                // In tinymce v4, height was just the height of the editable area.
                // In tinymce v5, these height also includes the toolbar, statusbar and menubar
                // This means we will add toolbar (39) + statusbar (18)
                return (getElementHeight('tox-editor-header', editorContainer) || 39) + (getElementHeight('tox-statusbar', editorContainer) || 18);
            }

            function setupTooltips(thisEditor) {
                var $tooltips = $('.tox-tbtn', thisEditor.getContainer());
                $tooltips.tooltip({
                    container: 'body'
                });

                // Update tooltip for Blocks dropdown before showing the tooltip
                // if there is a change in the dropdown option
                var $blockEl = $('.tox-tbtn--bespoke', thisEditor.getContainer());
                $blockEl.on('show.bs.tooltip', function() {
                    var $this = $(this);
                    if ($this.attr('title') != '' && $this.attr('title') != $this.attr('data-original-title'))
                        $this.attr('data-original-title', $this.attr('title'));

                    $this.attr('title', '');
                });
            }

            /*
                returns true if element is visible in view port either top or bottom or both top and bottom of element within viewport
                else returns false
            */
            function isElementVisibleInViewport(elem) {
                var elemTop = $(elem).offset().top;
                var elemBottom = elemTop + $(elem).outerHeight();
                var viewportTop = $(window).scrollTop();
                var viewportBottom = $(window).scrollTop() + $(window).height();

                /*
                  When resizing window and changing zoom levels, sometimes header position is fixed and sometimes the header UI changes
                  to navToggleBtn containing menuItems - here header position is not fixed to the page and is scrolled.
                  case:
                  When element bottom is behind the header region.
                */
                var nvbarToggleBtn = $("[data-target='#sp-nav-bar']");
                if (!nvbarToggleBtn.is(":visible")) {
                    viewportTop += $('header').height();
                }

                return elemBottom > viewportTop && elemTop < viewportBottom;
            }

            function updateContent(triggerOnChange) {
                var rawValue = thisEditor.getContent();
                var textContent = thisEditor.getContent({format: 'text'}).trim();
                var htmlRegex = /(iframe|img)/i;
                var content = (textContent || rawValue.match(htmlRegex)) ? rawValue : textContent;

                // In IE11, only on first drag drop of an image getContent({format: 'raw'}) is returning blob instead of correct src value
                // because of which image is incorrectly stored. As a workaround checking for blob content in src and replacing with actual content
                if (isIE11 && content.indexOf("src=\"blob:") !== -1)
                    content = thisEditor.getContent();

                content = spUtil.normalizeNewLines(content);

                $scope.model = content;
                if ($scope.field) {
                    $scope.field.stagedValue = content;
                    if (!triggerOnChange) {
                        $scope.field.value = content;
                    }
                }
            }

            function updateSync(triggerOnChange) {
                $scope.$apply(function() {
                    updateContent(triggerOnChange);
                });
            }

            function updateAsync(triggerOnChange) {
                $scope.$applyAsync(function() {
                    updateContent(triggerOnChange);
                });
            }

            var toolbar = ["undo redo", "blocks", "bold italic", "alignleft aligncenter alignright alignjustify", "bullist numlist outdent indent", "link unlink", "image", "codesample code"];
            if ($scope.toolBar)
                toolbar = $scope.toolBar;

            $scope.tinyMCEOptions = {
                init_instance_callback: function(editor) {
                    $scope.iframeElement = editor.iframeElement;
                },
                min_height: 100,
                height: '230px',
                theme: 'silver',
                menubar: false,
                language: userLanguage,
                remove_script_host: removeScriptHost,
                convert_urls: convertURLs,
                relative_urls: relativeURLs,
                statusbar: true,
                elementpath: false,
                plugins: "codesample lists code link powerpaste",
                lists_indent_on_tab: false,
                toolbar: toolbar.join(" | "),
                browser_spellcheck: true,
                debounce: false,
                powerpaste_html_import: 'prompt',
                branding: false,
                valid_children: '+body[style|link]',
                toolbar_mode: 'wrap',
                mobile: {
                    toolbar_mode: 'wrap'
                },
                content_style: 'ul {list-style-position: inside;}',
                cache_suffix: 'sysparm_substitute=false&v=' + g_builddate,
                setup: function(ed) {
                    thisEditor = ed;

                    ed.on('init', function() {
                        thisEditor.getDoc().documentElement.lang = g_lang;

                        // DEF0225654 : setting attributes irrespective of form and non-form usage(Knowledge Article Comments) of spTinymce.
                        var editorContainer = thisEditor.getContainer();
                        if (editorContainer)
                            editorContainer.style.height = parseInt(editorContainer.style.height) + getAdditionalHeights(editorContainer) + 'px';
                        setMode();
                        $timeout(function() {
                            setupTooltips(thisEditor);
                        });
                    });

                    ed.addCommand('imageUpload', function(ui, v) {
                        $scope.clickAttachment();
                    });

                    ed.ui.registry.addButton('image', {
                        icon: 'image',
                        tooltip: 'Insert image',
                        onAction: function(e) {
                            ed.execCommand('imageUpload');
                        },
                        stateSelector: 'img:not([data-mce-object],[data-mce-placeholder])'
                    });

                    ed.on('blur', function() {
                        updateAsync(false);
                        if (angular.isDefined($scope.snBlur))
                            $scope.snBlur();
                    });

                    ed.on('focus', function(e) {
                        var editArea = $(ed.contentAreaContainer)[0];
                        var toolBar = $(ed.container).find('.tox-editor-header')[0];

                        if (!editArea || !toolBar)
                            return;

                        // If we press tab, editor body should scroll in user viewport.
                        if (!isElementVisibleInViewport(editArea) || !isElementVisibleInViewport(toolBar))
                            toolBar.scrollIntoView();
                    });

                    ed.on('ProgressState', function(e) {
                        $rootScope.$emit('$sp.html.editor.progress', e);
                    });
                },
                images_upload_handler: function(blobInfo) {
                    return new Promise(function(resolve, reject) {
                        if ($scope.field && !$scope.field.readonly) {
                            var blob = blobInfo.blob();
                            var fileName = blobInfo.filename();
                            blob.name = "Pasted image" + fileName.substr(fileName.lastIndexOf("."));
                            var data = getTableAndSysId();
                            if (data.table && data.sys_id) {
                                thisEditor.setProgressState(true);
                                snAttachmentHandler.create(data.table, data.sys_id).uploadAttachment(blob, null, {}).then(function(response) {
                                    resolve("/sys_attachment.do?sys_id=" + response.sys_id);
                                    updateAsync(true);
                                }, function(error) {
                                    thisEditor.undoManager.undo();
                                    spUtil.addErrorMessage(error);
                                    reject();
                                }).finally(function() {
                                    thisEditor.setProgressState(false);
                                });
                            } else {
                                console.warn("GlideForm or table and record id is not provided");
                                reject();
                            }
                        }
                    });
                }
            };

            if ($scope.autoFocus == 'true')
                $scope.tinyMCEOptions.auto_focus = $scope.textareaId;

            if (g_portal_dark_theme_enabled) {
                $scope.tinyMCEOptions.skin = 'oxide-dark';
                $scope.tinyMCEOptions.content_css = 'dark';
            }

            $scope.attachFiles = function(result) {
                var data = getTableAndSysId();
                if (data.table && data.sys_id && result.files.length) {
                    thisEditor.setProgressState(true);
                    snAttachmentHandler.create(data.table, data.sys_id).uploadAttachments(result.files, null, {}).then(function(uploads) {
                        uploads.forEach(function(upload) {
                            var args = tinymce.extend({}, {
                                src: encodeURI("/sys_attachment.do?sys_id=" + upload.sys_id),
                                style: "max-width: 100%; max-height: 480px;"
                            });
                            updateAsync(true);
                            thisEditor.execCommand('mceInsertContent', false, thisEditor.dom.createHTML('img', args), {skip_undo: 1});
                        });
                    }, function(error) {
                        spUtil.addErrorMessage(error);
                    }).finally(function() {
                        thisEditor.setProgressState(false);
                    });
                }
            };

            // If using g_form we don't need to use watchers
            if (g_form && field) {
                g_form.$private.events.on('propertyChange', function(type, fieldName, propertyName) {
                    if (fieldName != field.name)
                        return;

                    updateMode();
                });

                updateMode();
            } else if (typeof $attrs.snDisabled != "undefined") {
                $scope.$watch('snDisabled', function(newValue) {
                    $attrs.disabled = newValue;
                });
            }

        },
        link: function(scope, element, attrs) {
            scope.attrs = attrs;
            scope.attrs.disabled = false;
            scope.clickAttachment = function() {
                element.find("input").click();
            };
        }
    }
}
