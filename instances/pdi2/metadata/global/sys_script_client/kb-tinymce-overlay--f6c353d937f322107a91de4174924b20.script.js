var globalOverlays = [];
var globalObservers = [];

function getParmVal(name) {
    var url = document.URL.parseQuery();
    if (url[name]) {
        return decodeURI(url[name]);
    }
}

function addButtons(rowDiv) {
    if (!rowDiv) return;

    var childDiv = rowDiv.children[0];
    if (!childDiv) return;

    childDiv.style.display = 'flex';
    childDiv.style.justifyContent = 'space-between';
    childDiv.style.alignItems = 'center';

    var buttonContainer = document.createElement('div');
    buttonContainer.style.display = "flex";
    buttonContainer.style.gap = "8px";
    buttonContainer.style.marginTop = '8px';
    buttonContainer.style.marginBottom = '8px';

    var gwt = new GwtMessage();
    var tinymceButton = document.createElement('button');
    tinymceButton.innerText = gwt.getMessage('Edit using old editor');
    tinymceButton.type = "button";
    tinymceButton.classList.add('btn', 'btn-default');
    tinymceButton.style.paddingTop = '6px';
    tinymceButton.style.paddingBottom = '6px';
    tinymceButton.style.paddingLeft = 'var(--now-global-space--lg)';
    tinymceButton.style.paddingRight = 'var(--now-global-space--lg)';
    tinymceButton.addEventListener('click', function() {
        closeAllOverlays();
    });

    var eceButton = document.createElement('button');
    eceButton.innerText = gwt.getMessage('Edit using improved editor');
    eceButton.type = "button";
    eceButton.classList.add('btn', 'btn-primary');
    eceButton.style.paddingTop = '6px';
    eceButton.style.paddingBottom = '6px';
    eceButton.style.paddingLeft = 'var(--now-global-space--lg)';
    eceButton.style.paddingRight = 'var(--now-global-space--lg)';
    eceButton.addEventListener('click', function() {
        var table = g_form.getTableName();
        var sysId = g_form.isNewRecord() ? "-1" : g_form.getUniqueValue();
        var queryParam = getParmVal("sysparm_query");
        var query = queryParam ? ("/params/query/" + encodeURIComponent(queryParam)) : "";
        var baseUrl = window.location.origin;
        var kcPath = "now/knowledge-center/record/" + table + "/" + sysId + query;
        var url = new URL(kcPath, baseUrl);
        window.location.href = url.toString();
    });

    buttonContainer.appendChild(tinymceButton);
    buttonContainer.appendChild(eceButton);

    childDiv.insertBefore(buttonContainer, childDiv.firstChild);
}

function getFieldNameFromEditor(editorDiv) {
    var textarea = editorDiv.parentElement.querySelector('textarea.htmlField');
    if (!textarea) return null;

    return textarea.name.split('.').pop();
}

function onLoad() {
    if (g_scratchpad.isKnowledgeCenterEnabled === "false" || g_scratchpad.isECERedirectionEnabled === "false") {
        return;
    }

    if (!g_user.hasRoleFromList('knowledge', 'knowledge_manager', 'knowledge_admin')) {
        return;
    }

    waitForTinyMCE(function(editors) {
        editors.forEach(function(ed) {
			var fieldName = getFieldNameFromEditor(ed.editorDiv);
			if (!fieldName) return;
			var editableFieldsMap = g_scratchpad.versioning ? g_scratchpad.versioning.editableFieldsMap : null;
			//Field is NOT editable skip overlay
			if (editableFieldsMap && !editableFieldsMap[fieldName]) {
				return;
			}
			
            // Skip if overlay already exists
            if (ed.editorDiv.getAttribute('data-overlay-added')) return;

            var editorDiv = ed.editorDiv;
            var wrapper = document.createElement('div');
            wrapper.style.position = "relative";
            editorDiv.parentNode.insertBefore(wrapper, editorDiv);
            wrapper.appendChild(editorDiv);

            var rowDiv = wrapper.parentElement.querySelector('.row');
            addButtons(rowDiv);

            var overlay = document.createElement('div');
            overlay.style.position = "absolute";
            overlay.style.top = "0";
            overlay.style.right = "0";
            overlay.style.bottom = "0";
            overlay.style.left = "0";
            overlay.style.display = "flex";
            overlay.style.backgroundColor = "rgba(var(--now-color--neutral-21), 0.5)";
            overlay.style.alignItems = "flex-start";
            overlay.style.justifyContent = "flex-end";
            overlay.style.paddingRight = 'var(--now-global-space--lg)';
            overlay.style.zIndex = 1;
            globalOverlays.push(overlay);

            wrapper.appendChild(overlay);
            editorDiv.setAttribute('data-overlay-added', 'true');
        });
    });
}

function waitForTinyMCE(callback) {
    var observer = new MutationObserver(function(mutations, obs) {
        var editors = [];
        var textareas = document.querySelectorAll('textarea');

        for (var i = 0; i < textareas.length; i++) {
            var textarea = textareas[i];
            var wrapper = textarea.parentElement;
            if (!wrapper) continue;

            var editorDivs = wrapper.getElementsByClassName('tox-tinymce');
            for (var j = 0; j < editorDivs.length; j++) {
                editors.push({
                    editorDiv: editorDivs[j]
                });
            }
        }

        if (editors.length > 0) {
            callback(editors);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    globalObservers.push(observer);
}

function closeAllOverlays() {
    globalOverlays.forEach(function(ov) {
        if (ov.parentNode) ov.parentNode.removeChild(ov);
    });
    globalOverlays = [];

    globalObservers.forEach(function(obs) {
        obs.disconnect();
    });
    globalObservers = [];
}
