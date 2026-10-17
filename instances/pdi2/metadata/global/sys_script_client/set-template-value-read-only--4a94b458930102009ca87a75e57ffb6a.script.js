function onLoad() {
    var tableName = g_form.getTableName();
    var templateValueColName = 'template_value';

    if (isDoctype())
        setTemplateReadOnlyDoctype();
    else
        setTemplateReadOnlyNonDoctype();

    function setTemplateReadOnlyDoctype() {
        var templateFieldHandler = g_form.elementHandlers[tableName + "." + templateValueColName];
        var fDiv;
        if (templateFieldHandler && templateFieldHandler.fDiv && templateFieldHandler.fDiv.parentElement)
            fDiv = templateFieldHandler.fDiv;
        else
            fDiv = document.getElementById('std_change_proposal.template_value');

        if (fDiv && fDiv.parentElement) {
            var polarisStyleSheet = document.createElement("style");
            polarisStyleSheet.innerHTML =
                ".-polaris [id='element.std_change_proposal.template_value'] {\n" +
                "flex-grow: 1;\n" +
                "}\n\n" +
                ".-polaris [id='element.std_change_proposal.template_value'] .condition-row__field-cell {\n" +
                "width: 255px;\n" +
                "}\n\n" +
                ".-polaris [id='element.std_change_proposal.template_value'] .filter_row_condition {\n" +
                "table-layout: fixed;\n" +
                "width: 95%;\n" +
                "}\n\n" +
                ".-polaris [id='element.std_change_proposal.template_value'] .filerTableInput {\n" +
                "max-width: 100%;\n" +
                "min-width: 50%;\n" +
                "}";

            fDiv.parentElement.prepend(polarisStyleSheet);
        }

        templateFieldHandler._disableClass = function(parentElement, className, disabled) {
            var wrappedParent = $(parentElement);
            var elements = wrappedParent.select("." + className);
            if (!elements)
                return;
            var disableControlField = function(element) {
                g_form.setDisabledControl(element, disabled);
            };
            elements.forEach(disableControlField, this);
            elements = wrappedParent.select(".filter-reference-input");
            if (!elements)
                return;
            elements.forEach(disableControlField, this);
        };

        // override this function to include disabling elements with class "filter-reference-input
        templateFieldHandler.setReadOnly = function(disabled) {
            var parentElement = this.fDiv.parentNode;
            if (this._toggleReadOnlyAttribute)
                this._toggleReadOnlyAttribute(disabled);
            this._hideClass(parentElement, "icon-calendar", disabled);
            this._hideClass(parentElement, "filerTableAction", disabled);
            this._disableClass(parentElement, "filerTableSelect", disabled);
            this._disableClass(parentElement, "filerTableInput", disabled);
            this._disableClass(parentElement, "filter-reference-input", disabled);
            this.setFilterReadOnly(disabled);
            this.disabledFilter = disabled;
        };

        // override this function to set the field back to read only once setValue has been called
        templateFieldHandler.setValue = function(value) {
            this.setQuery(value);
            if (this.filterReadOnly)
                this.setReadOnly("true");
        };

        // override this function to prevent the removal of the entire template field from the form
        // when "setReadOnly" is called
        templateFieldHandler._hideClass = function(parentElement, className, hideIt) {
            var elements = $(parentElement).select("." + className);
            for (var i = 0; i < elements.length; i++) {
                if (hideIt)
                    hideObject(elements[i]);
                else
                    showObjectInline(elements[i]);
            }

            var placeholderRows = parentElement.select('tr.filter_row_condition[type="placeholder"]');
            if (placeholderRows && placeholderRows[0])
                placeholderRows[0].setStyle(hideIt ? "display:none" : "display:table");
        };

        if (g_scratchpad.is_template_readonly) {
            CustomEvent.observe('filter:GlideTemplateFilter-done', function() {
                g_form.setReadOnly(templateValueColName, true);
            });
            setLateRenderedFieldsToReadOnly();
        }

        function setLateRenderedFieldsToReadOnly() {
            var templateValElem = templateFieldHandler.fDiv.parentNode;
            var config = {
                childList: true,
                subtree: true,
                attributes: false,
                characterData: false,
            };
            var callback = function(mutationsList, observer) {
                if (mutationsList.some(function(mtn) {
                        return $(mtn.target).select('.icon-calendar').length > 0;
                    })) {
                    templateFieldHandler._hideClass(templateValElem, "icon-calendar", true);
                    templateFieldHandler._disableClass(templateValElem, "filerTableInput", true);
                }
            };
            var observer = new MutationObserver(callback);
            observer.observe(templateValElem, config);
        }
    }

    function setTemplateReadOnlyNonDoctype() {
        if (!g_scratchpad.is_template_readonly)
            return;

        var filterParentEl;
        var i = 0;
        var timedFilterCheck = setInterval(function() {
            if (GlideFilter && !filterParentEl && g_form.getValue(
                    templateValueColName)) { //check for filter to be ready
                if (i > 10) {
                    clearInterval(timedFilterCheck);
                }
                filterParentEl = gel(tableName + '.' + templateValueColName +
                    'gcond_filters');

                if (filterParentEl) {
                    var _hideClass = GlideFilter.prototype._hideClass;
                    var _disableClass = GlideFilter.prototype._disableClass;
                    var disabled = true;
                    _hideClass(filterParentEl, "filerTableAction", disabled);
                    _disableClass(filterParentEl, "filerTableSelect", disabled);
                    _disableClass(filterParentEl, "filerTableInput", disabled);
                    _disableClass(filterParentEl, "filter-reference-input", disabled);
                }
                i++;
            }
        }, 50); //end of setInterval
    }
}
