function onChange(control, oldValue, newValue, isLoading, isTemplate) {

	(function(top) {
		debugger;
		if (!top) {
			return;
		}
		var window = top;
		var closestDeep = function (el, selector) {
			if (!el) return null;
			if (selector.indexOf('*') !== -1) {
				if (el.tagName.toLowerCase().indexOf(selector.replace('*', '')) !== -1)
					return el;
				else {
					if (el.parentElement !== null)
						return closestDeep(el.parentElement, selector);
					// escape the shadow root
					if (el.getRootNode() !== null)
						return closestDeep(el.getRootNode().host, selector);
				}
			} else {
				if (el.matches(selector)) return el;
			}
			if (el.parentElement !== null)
				return closestDeep(el.parentElement, selector);
			// escape the shadow root
			if (el.getRootNode() !== null)
				return closestDeep(el.getRootNode().host, selector);
		};

		var querySelectorAllDeep = function(
			selector,
			rootEl,
			nestedMatches,
			rootEleMatches
		) {
			if (nestedMatches == null)
				nestedMatches = true;

			if (rootEleMatches == null)
				rootEleMatches = true;

			if (!rootEl) rootEl = window.document.body;
			var matches = [];
			if (rootEleMatches && rootEl.matches && rootEl.matches(selector))
				matches.push(rootEl);
			var children = rootEl.children;
			if (children) {
				for (var i = 0; i < children.length; i++) {
					if (children[i].matches && children[i].matches(selector)) {
						matches.push(children[i]);
						if (nestedMatches === false) continue;
					}
					var childMatches = querySelectorAllDeep(
						selector,
						children[i],
						rootEleMatches,
						false
					);
					childMatches.forEach(function(c) { return matches.push(c); });
				}
			}
			if (rootEl.shadowRoot) {
				var shadowChildren = querySelectorAllDeep(
					selector,
					rootEl.shadowRoot,
					nestedMatches
				);
				shadowChildren.forEach(function(sc) {
					matches.push(sc);
				});
			}
			return matches;
		};

		var maxIterations = 30;

		function overrideUnsupportedFields() {
			console.log('overriding', maxIterations);
			if (!window || !window.document) {
				return;
			}

			// If a 'script' type field is rendered using `sn-record-input` element, consider it unsupported
			var unsupportedScriptFields = querySelectorAllDeep('sn-record-input')
				.filter(function(field) {
					if (field.getProperties()) {
						var props = field.getProperties() || {};
						var fieldType = props.fieldType;
						var description = props.description;
						var readonly = props.readonly;
						var value = props.value;
						return fieldType === 'script';
					}
				});

			if (!unsupportedScriptFields.length) {
				if (--maxIterations >= 0) {
					setTimeout(overrideUnsupportedFields, 1000);
				}
			}

			unsupportedScriptFields.forEach(function(scriptField) {
				if (scriptField.__formScriptOverride) // already overriden
					return;

				// Replace 'sn-record-input' with a 'now-code-editor'
				var formElement = closestDeep(scriptField, 'now-record-form-section-column-layout');
				if (!formElement) {
					// console.debug('[UnsupportedFormFieldsOverride] Parent Form Not found');
					return;
				}
				var fieldValue = formElement.fields[scriptField.name];
				var originalScriptValue = fieldValue.originalValue || fieldValue.value;
				var isFieldReadOnly = fieldValue.readonly || false;
				var scriptInput = querySelectorAllDeep('input.now-input-native', scriptField)[0];
				if (!scriptInput) {
					// console.debug('[UnsupportedFormFieldsOverride] Input not found inside sn-record-input');
					return;
				}
				// Insert a now-code-editor next to the sn-record-input
				var codeEditor = newJSCodeEditor(originalScriptValue, isFieldReadOnly);
				var container = scriptInput.parentElement;
				container.style.height = 'auto';
				container.insertBefore(codeEditor, scriptInput);

				// Hide the sn-record-input element
				scriptInput.style.display = 'none';

				var descriptionTextUnsupported = querySelectorAllDeep('p.sn-control-description', scriptField)[0];
				if (descriptionTextUnsupported) {
					descriptionTextUnsupported.style.display = 'none';
				}

				// Listen to changes from now-code-editor and set the value back on the sn-record-input
				codeEditor.addEventListener('NOW_CODE_EDITOR#CONTENT_CHANGED', function (e) {
					var payload = e.detail.payload;
					var newVal = payload.text;
					scriptField.value = newVal;
					scriptField.onValueChange(e, scriptField.name, newVal, newVal, null, {});
				});

				// Mark the script field to avoid processing again
				scriptField.__formScriptOverride = true;
			});
			function newJSCodeEditor(value, readOnly) {
				var editor = window.document.createElement('now-code-editor');
				editor.language = 'javascript';
				editor.content = value || '';
				editor.readOnly = readOnly || false;
				editor.scope = 'global'; // TODO: What is the right scope?
				return editor;
			}
		}

		setTimeout(overrideUnsupportedFields, 1000);

	})(top);

}
