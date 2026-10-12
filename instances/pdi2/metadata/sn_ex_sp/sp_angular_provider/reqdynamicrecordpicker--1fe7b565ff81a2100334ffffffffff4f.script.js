function ReqDynamicRecordPicker(snRecordPickerDirective, $timeout, escapeHtml, i18n, $http, select2EventBroker, filterExpressionParser, urlTools) {
    var dir = {};

    function cleanLabel(val) {
        if (val && typeof val == "object")
            return typeof val.display_value == "string" ? val.display_value.trim() : "";
        return typeof val == "string" ? val.trim() : val;
    }

    //extends source code found at /scripts/sn/common/controls/directive.snRecordPicker.js
    angular.extend(dir, snRecordPickerDirective[0], {
        name: "reqDynamicRecordPicker",
        require: "reqDynamicRecordPicker",
    });

    // This is the new link function that we want to call in this new record picker
    // only overwrite link function for this extension
    var link = function myLinkFnOverride(scope, element, attrs, ctrl) {
        var TOKENIZER = '####';
        var isExecuting = false;
        var defaultPlaceholder = '    ';

        function getItemId(item) {
            // Preserve current behavior: id comes from valueField
            return item && item[scope.valueField];
        }

        function getItemText(item) {
            // Preserve current display fallback priority used throughout the file
            var txt = '';
            if (item) {
                if (scope.displayField && angular.isDefined(item[scope.displayField]))
                    txt = item[scope.displayField];
                else if (item.name)
                    txt = item.name;
                else if (item.title)
                    txt = item.title;
                else if (item.text)
                    txt = item.text;
            }
            return cleanLabel(txt);
        }

        var select2Helpers = {
            formatSelection: function (item) {
                return escapeHtml(getItemText(item));
            },
            onOpening: function (e) {
                select2EventBroker.publishSelect2Opening();
            },
            formatResult: function (item) {
                var displayFields = getdisplayFields(item);
                if (displayFields.length == 1)
                    return escapeHtml(getItemText(item));
                if (displayFields.length > 1) {
                    var markup = escapeHtml(getItemText(item));
                    var width = 100 / (displayFields.length - 1);
                    markup += "<div>";
                    for (var i = 1; i < displayFields.length; i++)
                        markup += "<div style='width: " + width + "%;' class='select2-additional-display-field'>" + escapeHtml(cleanLabel(displayFields[i])) + "</div>";
                    markup += "</div>";


                    return markup;
                }
                // Fallback to standard Select2 text if no displayFields were derived
                if (item && item.text)
                    return escapeHtml(cleanLabel(item.text));
                return "";
            },
            search: function (queryParams) {
                var url = '/api/now/table/' + scope.table + '?' + urlTools.encodeURIParameters(queryParams.data);
                if (scope.options && scope.options.cache && cache[url])
                    return queryParams.success(cache[url]);
                return $http.get(url).then(function (response) {
                    if (scope.options && scope.options.cache) {
                        cache[url] = response;
                    }
                    return queryParams.success(response)
                });
            },
            initSelection: function (elem, callback) {
                if (scope.field.displayValue) {
                    if (scope.multiple) {
                        var items = [], sel;
                        var values = scope.field.value.split('####');
                        var displayValues = scope.field.displayValue.split(TOKENIZER);
                        for (var i = 0; i < values.length; i++) {
                            sel = {};
                            sel[scope.valueField] = values[i];
                            sel[scope.displayField] = displayValues[i];
                            items.push(sel);
                        }
                        callback(items);
                    }
                    else {
                        var sel = {};
                        sel[scope.valueField] = scope.field.value;
                        sel[scope.displayField] = scope.field.displayValue;
                        callback(sel);
                    }
                } else
                    callback([]);
            },
        };
        function getPlaceholder() {
            return scope.placeholder || defaultPlaceholder;
        }
        var lookupMsg = jQuery("<span class='sr-only' />");
        lookupMsg.text(i18n.getMessage("Lookup using list"));
        function setAccessiblePlaceholder() {
            if (!scope.multiple && !scope.field.value && getPlaceholder() === defaultPlaceholder)
                element.parent().find('.select2-chosen').append(lookupMsg);
        }
        var config = {
            i18n: i18n,
            width: '100%',
            containerCssClass: 'select2-reference ng-form-element',
            placeholder: getPlaceholder(),
            formatSearching: '',
            allowClear: (scope.options && typeof scope.options.allowClear !== "undefined") ? scope.options.allowClear : true,
            id: function (item) {
                return getItemId(item);
            },
            ajax: {
                quietMillis: NOW.ac_wait_time,
                data: function (filterText, page) {
                    var fields = [scope.valueField, 'name', 'title'];
                    if (scope.displayField)
                        fields.push(scope.displayField);
                    if (scope.displayFields)
                        fields.push(scope.displayFields);
                    var params = {
                        sysparm_offset: (scope.pageSize * (page - 1)),
                        sysparm_limit: scope.pageSize,
                        sysparm_query: buildQuery(filterText, scope.searchFields, scope.defaultQuery),
                        sysparm_fields: fields.join(','),
                        sysparm_display_value: true
                    };
                    return params;
                },
                results: function (data, page) {
                    return ctrl.filterResults(data, page, scope.pageSize);
                },
                transport: select2Helpers.search
            },
            formatSelection: select2Helpers.formatSelection,
            formatResult: select2Helpers.formatResult,
            formatResultCssClass: function () { return ''; },
            initSelection: select2Helpers.initSelection,
            multiple: scope.multiple,
        };
        function buildQuery(filterText, searchFields, defaultQuery) {
            var queryParts = [];
            var operator;
            if (window.g_ref_ac_startswith || scope.startswith)
                operator = "STARTSWITH";
            else
                operator = "CONTAINS";
            if (filterText.startsWith("*")) {
                operator = "CONTAINS";
                filterText = filterText.substring(1);
            }
            if (defaultQuery)
                queryParts.push(defaultQuery);
            var filterExpression = filterExpressionParser.parse(filterText, operator);
            if (searchFields != null) {
                var fields = searchFields.split(',');
                if (filterExpression.filterText != '') {
                    var OR = "";
                    for (var i = 0; i < fields.length; i++) {
                        queryParts.push(OR + fields[i] + filterExpression.operator + filterExpression.filterText);
                        OR = "OR";
                    }
                }
                for (var i = 0; i < fields.length; i++)
                    queryParts.push('ORDERBY' + fields[i]);
                queryParts.push('EQ');
            }
            if (defaultQuery && typeof (defaultQuery) == 'string' && defaultQuery.indexOf('ORDERBY') != -1)
                queryParts.push(defaultQuery);
            return queryParts.join('^');
        }
        scope.field = scope.field || {};
        if (scope.field.displayValue && scope.multiple)
            scope.field.displayValue = scope.field.displayValue.replace(new RegExp(TOKENIZER, 'g'), TOKENIZER);
        var initTimeout = null;
        var oldValue = scope.field.value;
        var $select;
        var select2Container;
        var select2Focusser;
        function init() {
            element.css("opacity", 0);
            $timeout.cancel(initTimeout);
            initTimeout = $timeout(function () {
                i18n.getMessage('Searching...', function (searchingMsg) {
                    config.formatSearching = function () {
                        return searchingMsg;
                    };
                });
                i18n.getMessage('Loading more results...', function (msg) {
                    config.formatLoadMore = function () {
                        return msg;
                    };
                });
                i18n.getMessage('No matches found', function (msg) {
                    config.formatNoMatches = function () {
                        return msg;
                    };
                });
                element.css("opacity", 1);
                element.select2("destroy");
                $select = element.select2(config);
                $select.bind("change", onChanged);
                $select.bind("select2-selecting", onSelecting);
                $select.bind("select2-removing", onRemoving);
                $select.bind("sn-atf-setvalue", onAtfSetValue);
                $select.bind("select2-opening", select2Helpers.onOpening);
                scope.$emit('select2.ready', element);
                select2Container = element.data('select2').container;
                select2Container.find(".select2-focusser").attr("aria-label", getAriaLabel()).attr("aria-controls", "select2-drop");
                select2Container.find("ul.select2-results").attr("aria-label", scope.snAriaLabel || scope.field.name || scope.table);
                var select2ResultsId = select2Container.find('ul.select2-results').attr('id');
                select2Container.find(".select2-input").attr("aria-controls", select2ResultsId);

                // Ensure spacebar types a space in the search box (prevent container from hijacking it)
                select2Container.on('keydown keypress', '.select2-input', function (e) {
                    if (e.which === 32) {
                        e.stopPropagation();
                    }
                });

                updateAriaExpanded(false);
                if (!scope.multiple) {
                    var closeButton = select2Container.find('.select2-search-choice-close');
                    var clearTitle = getAriaClearLabel();
                    closeButton.attr({
                        'aria-label': clearTitle, 'title': clearTitle,
                        'tabindex': 0, 'role': 'button', 'data-toggle': 'tooltip', 'data-container': 'body'
                    });
                    closeButton.parent().attr({ 'draggable': false });
                    closeButton.on('mousedown touchend', function (e) {
                        e.stopPropagation();
                    });
                    closeButton.on('click', function (e) {
                        e.stopPropagation();
                        element.select2('val', '', true);
                    });
                    closeButton.on('keydown', function (e) {
                        if (e.which === 13 || e.which === 32)
                            element.select2('val', '', true);
                    });
                    select2Focusser = select2Container.find('.select2-focusser')[0];
                    var anchorEle = select2Container.find('.select2-choice')[0];
                    select2Focusser.parentNode.insertBefore(select2Focusser, anchorEle);
                }
                setAccessiblePlaceholder();
            });
        }
        function getAriaClearLabel() {
            var field = scope.field;
            var label = scope.snAriaLabel || field.name || scope.table;
            return i18n.format(i18n.getMessage('Clear field {0}'), label);
        }
        function getAriaLabel() {
            var label = "", field = scope.field;
            label += scope.snAriaLabel || field.name || scope.table;
            if (field.displayValue || field.value) {
                label += (" " + (field.displayValue || field.value));
            }
            return label || i18n.getMessage("Choose");
        }
        function onAtfSetValue(e) {
            var valueToSet = e.detail ? e.detail.newValue : null;
            if (scope.multiple) {
                var data = element.select2("data");
                for (var i = 0; i < data.length; i++) {
                    element.triggerHandler({ type: "select2-removing", choice: data[i] });
                }
                if (!valueToSet)
                    return;
                var selected = {};
                selected[scope.valueField] = valueToSet.value;
                if (scope.displayField)
                    selected[scope.displayField] = valueToSet.displayValue;
                element.triggerHandler({ type: "select2-selecting", choice: selected });
                return;
            }
            var changeEventParameters = { type: "change" };
            if (scope.field.value)
                changeEventParameters.removed = element.select2("data");
            if (valueToSet) {
                var added = {};
                added[scope.valueField] = valueToSet.value;
                if (scope.displayField)
                    added[scope.displayField] = valueToSet.displayValue;
                changeEventParameters.added = added;
                element.val(valueToSet.value);
                scope.field.displayValue = valueToSet.displayValue;
                changeEventParameters.val = valueToSet.value;
            } else
                element.val("");
            element.triggerHandler(changeEventParameters);
        }
        function onSelecting(e) {
            isExecuting = true;
            oldValue = scope.field.value;
        }
        
        function onRemoving(e) {
            isExecuting = true;
            oldValue = scope.field.value;
        }

        function callChange(oldValue, e) {
            var f = scope.field;
            var p = {
                field: f,
                newValue: f.value,
                oldValue: oldValue,
                displayValue: f.displayValue,
                categoryId: attrs && attrs.id
            }
            // Normalize and include added/removed in the payload so consumers can react to clear/select events
            if (e && e.added) {
                var added = e.added || e.choice || {};
                p.added = {
                    sys_id: added[scope.valueField] || added.sys_id || '',
                    name: (scope.displayField && added[scope.displayField]) || added.name || added.title || added.text || f.displayValue || ''
                };
            }
            if (e && e.removed) {
                var removed = e.removed || e.choice || {};
                p.removed = {
                    sys_id: removed[scope.valueField] || removed.sys_id || '',
                    name: (scope.displayField && removed[scope.displayField]) || removed.name || removed.title || removed.text || ''
                };
            }
            scope.$emit("field.change", p);
            scope.$emit("field.change." + f.name, p);
            if (scope.onChange)
                try {
                    scope.onChange(e);
                } catch (ex) {
                    console.log("directive.snRecordPicker error in onChange")
                    console.log(ex)
                }
            isExecuting = false;
        }
        function onChanged(e) {
            e.stopImmediatePropagation();
            if (scope.$$phase || scope.$root.$$phase) {
                console.warn('in digest, returning early');
                return;
            }
            if (e.added) {
                var selectedItem = e.added;
                if (!scope.multiple) {
                    scope.field.value = selectedItem[scope.valueField];
                    if (scope.field.value) {
                        scope.field.displayValue = getItemText(selectedItem);
                    } else
                        scope.field.displayValue = '';
                }
            } else if (e.removed) {
                if (!scope.multiple) {
                    scope.field.displayValue = '';
                    scope.field.value = '';
                    setTimeout(function () {
                        select2Focusser.focus();
                    });
                }
            }
            select2Container.find(".select2-focusser").attr("aria-label", getAriaLabel());
            setAccessiblePlaceholder();
            scope.$apply(function () {
                callChange(oldValue, e);
            });
        }
        function getDisplayValue(selectedItem) {
            return getItemText(selectedItem);
        }
        function getdisplayFields(selectedItem) {
            var displayFields = [];
            if (selectedItem && selectedItem[scope.valueField])
                displayFields.push(getItemText(selectedItem));
            if (scope.displayFields) {
                var columns = scope.displayFields.split(",");
                for (var i = 0; i < columns.length; i++) {
                    var column = columns[i];
                    if (selectedItem[column])
                        displayFields.push(selectedItem[column]);
                }
            }
            return displayFields;
        }
        scope.$watch("field.value", function (newValue) {
            if (isExecuting) return;
            if (angular.isDefined(newValue) && $select) {
                if (scope.multiple)
                    $select.select2('val', newValue.split(',')).select2('close');
                else
                    $select.select2('val', newValue).select2('close');
            }
        });
        function updateAriaExpanded(isOpen) {
            var select2Parent = element.data('select2');
            if (scope.multiple)
                select2Parent.container.find(".select2-choices input[role='combobox']").attr("aria-expanded", isOpen);
            else
                select2Parent.focusser.attr("aria-expanded", isOpen);
        }
        element.bind("select2-open", function () {
            updateAriaExpanded(true);
        });

        element.bind("select2-close", function () {
            updateAriaExpanded(false);
        });
        if (attrs.displayValue) {
            attrs.$observe('displayValue', function (value) {
                scope.field.value = value;
            });
        }
        init();

    };

    dir.compile = function () {
        return function (scope, element, attrs) {
            link.apply(this, arguments);
        };
    };
    return dir;
}
