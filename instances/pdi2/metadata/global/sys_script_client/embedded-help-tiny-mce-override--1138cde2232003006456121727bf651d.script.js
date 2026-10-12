function onLoad() {
	
    window.onload = function() {
		// Check if TinyMCE is activated on the page.
		// Will not be activated if accessed from a different scope
		if(!isEmpty(window.tinyMCE)) {
			
			var iframe = document.getElementsByTagName('iframe')[0];
			
			// iFrame object is empty in IE during a window.onload
			// control statement to handle IE case.
			if (!isEmpty(iframe))
				overRideTinyMce(tinyMCE);
			else {
				tinyMCE.activeEditor.on('init', function() {
					var iframe = document.getElementsByTagName('iframe')[0];
					iframe.addEventListener('load', function() {
						overRideTinyMce(tinyMCE);
					});
				});
			}
		}
	};

	function overRideTinyMce(tinyMCE) {

		var isUsingPolaris = window.NOW.isUsingPolaris;
		// HTML constants for tinyMCE
		var tmceRelatedInfo = '<div class="related-links role-embedded_help_admin tm-element">' +
			'<div class="relinfo">' +
			'<div class="reltitle">' + getMessage('Related information') +
			'<br />' +
			'<div></div>' +
			'</div>' +
			'</div>' +
			'</div><p></p>';

		var tmceNote = '<div class="note tm-element">' +
			'<span class="notetitle">' + getMessage('Note:') + '</span>' +
			'</div>' +
			'<p></p>';
		
		// Styles for items within the tiny mce active editor
		var tmceEditor = "body{background-color:#293e40 !important;}" +
			"td, div{border: 1px dotted #7c8792 !important;}" +
			"div iframe{height:150px !important; width:245px !important;}";

		// Initialize the tiny mce editor here
		var tinyMCEInit = {
			height: 500,
			menubar: false,
			branding: false,
			formats: {
				bold: {inline: 'span', classes: 'ph uicontrol'},
				custom_header: {block: 'h1', classes: 'title topictitle1'},
				section_title: {block:'h2', classes: 'title sectiontitle'}
			},
			force_p_newlines : true,
			body_class: 'help-content',
			content_css:[
				'styles/sn/concourse/css_includes_concourse.cssx'
			],
			content_style: tmceEditor,
			/**
			 * Files served from glide are processed to find and replace "${...}".
			 * This can be an issue for third party scripts/libraries that might have these as part of regular expressions.
			 * We use tinymce's cache buster mechanism to append substitue = false, so that glide doesn't garble the script.
			 * @see https://www.tiny.cloud/docs/configure/integration-and-setup/#cache_suffix
			 */
			cache_suffix: '?sysparm_substitute=false',
			skin: isUsingPolaris ? 'sn-editor-themed' : 'heisenberg',
			plugins: 'autolink lists charmap anchor searchreplace visualblocks code codemirror link',
			extended_valid_elements : 'hp-doc-content[sys-id|resource-id|type|title|url|source-type|contenteditable]',
			custom_elements : 'hp-doc-content',
			toolbar: 'bold italic | undo redo | title sectionTitle | bullist numlist | note link relatedlinks table media newline | code',
			language: g_scratchpad.user_lang || "en",
			setup: function(editor) {

				// Override styles on tiny mce editor initialization
				editor.on('init', function(e) {

					var linkElement = document.createElement('link');
					linkElement.setAttribute('rel', 'stylesheet');
					linkElement.setAttribute('type', 'text/css');
					linkElement.setAttribute('href', '/styles/app.embedded_help/embedded_help_tinymce_override.css');

					document.head.appendChild(linkElement);
				});

				// Add custom buttons for the Tiny MCE editor.
				// Current custom servicenow buttons: title, section title, note, table, video, newline

				editor.ui.registry.addButton('title', {
					type: 'button',
					text: getMessage('Title'),
					tooltip: getMessage('Title of the Embedded Help Content'),
					onAction: function(e) {
						editor.formatter.toggle('custom_header');
					},
					onPostRender: function() {
						var btn = this;
						editor.on('init', function() {
							editor.formatter.formatChanged('custom_header', function(state) {
								btn.active(state);
							});
						});
					}
				});
				editor.ui.registry.addButton('sectionTitle', {
					type: 'button',
					text: getMessage('Section Title'),
					tooltip: getMessage('Header for sections within the content'),
					onAction: function(e) {
						editor.formatter.toggle('section_title');
					},
					onPostRender: function() {
						var btn = this;
						editor.on('init', function() {
							editor.formatter.formatChanged('section_title', function(state) {
								btn.active(state);
							});
						});
					}
				});
				editor.ui.registry.addButton('note', {
					type: 'button',
					icon: 'document-properties',
					tooltip: getMessage('Insert a note section'),
					onAction: function(e) {
						editor.insertContent(tmceNote);
					}
				});
				editor.ui.registry.addButton('relatedlinks', {
					type: 'button',
					icon: 'indent',
					tooltip: getMessage('Insert related information section'),
					onAction: function(e) {
						editor.insertContent(tmceRelatedInfo);
					}
				});
				editor.ui.registry.addButton('table', {
					icon: 'table',
					tooltip: getMessage('Insert a table section'),
					onAction: function() {
						editor.execCommand('snTable');
					}
				});
				editor.ui.registry.addButton('media', {
					icon: 'embed',
					tooltip: getMessage('Insert a video section'),
					onAction: function() {
						editor.execCommand('snMedia');
					}
				});
				editor.ui.registry.addButton('newline', {
					icon: 'line',
					tooltip: getMessage('Add a newline after section elements'),
					onAction: function() {
						editor.execCommand('snNewline');

					}
				});

				// Create actions for servicenow custom buttons
				editor.addCommand('snMedia', function () {
					tinyMCEMedia(editor);
				});

				editor.addCommand('snTable', function() {
					tinyMCETable(editor);
				});

				editor.addCommand('snNewline', function() {
					tinyMCENewline(editor);
				});

				editor.on('NodeChange', function(e) {
					var element = e.element;
					var parent = e.parents[1];
					styleList(element, parent);
				});
			}
		};

		/* Wrap in timeout in order to force the removal of tinyMCE editor to happen
			after the initialization of the original tinyMCE */
		setTimeout(function(){
			tinyMCE.get('sys_embedded_help_content.content').remove();
			tinyMCE.execCommand("mceAddEditor", false, {id:'sys_embedded_help_content.content', options: tinyMCEInit});
		}, 0);
	}

	function styleList(element, parent) {
		if (element.tagName === 'LI') {
			element.classList.add('li');
			if (parent.tagName === 'UL' || parent.tagName === 'OL') {
				var parentClass = parent.classList;
				if (parentClass.length === 0 ) {
					if (!hasListParent(element.parentNode)) {
						if (parent.tagName === 'UL')
							parentClass.add('steps-unordered');
						else
							parentClass.add('steps-ordered');
					} else {
						if (parent.tagName === 'UL')
							parentClass.add('ul');
						else
							parentClass.add('ol');

						parentClass.add('substeps');
					}
				}
				if (parentClass.contains('steps-ordered') || parentClass.contains('steps-unordered'))
					element.classList.add('step');
				else if (parentClass.contains('step'))
					element.classList.add('substeps');
				else if (parentClass.contains('substeps'))
					element.classList.add('substep');
			}
		} else if (element.tagName === 'OL' || element.tagName === 'UL') {
			if (element.tagName === 'OL' )
				element.classList.add('steps-ordered');
			else
				element.classList.add('steps-unordered');
		}
	}

	/**
	 * Returns link to servicenow tinymce plugins given the plugin name
	 * @param {string} name
	 * @param {boolean} min
	 * @return {string}
	 */
	function snDir(name, min) {
		return '/scripts/tinymce4_4_3/sn_plugins/' + name + '/plugin' + (min ? '.min' : '') + '.js';
	}

	/**
	 * Generate a Glide Dialog Window for a user to insert a video
	 * @param {object} editor
	 */
	function tinyMCEMedia(editor) {
		var g_dialog = new GlideDialogWindow('embedded_help_insert_video_dialog');
		g_dialog.setTitle(getMessage('Insert Video'));

		g_dialog.setPreference('action', function(param) {
				g_dialog.destroy();
				if (!param) // user must have pressed Cancel
					return false;

				// insert the selected video object
 				var videoText = createVideoText(param);
 				editor.execCommand('mceInsertContent', false, videoText);

			});
		g_dialog.render();
	}

	/**
	 * Generate a Glide Dialog Window for a user a table
	 * @param {object} editor
	 */
	function tinyMCETable(editor) {
		var g_dialog = new GlideDialogWindow('embedded_help_insert_table_dialog');
		g_dialog.setTitle(getMessage('Insert Table'));

		g_dialog.setPreference('action', function(param) {
			g_dialog.destroy();
			if (!param) //user must have pressed Cancel
				return false;

			var tableHTML = createTable(param.rows);
			editor.execCommand('mceInsertContent', false, tableHTML);
		});
		g_dialog.render();
	}

	/**
	 * Inserts newline, p tags, after the current section that the users cursor is in
	 * @param {object} editor
	 */
	function tinyMCENewline(editor) {
		var currentSelectedNode = editor.selection.getNode();
		var pTag = tinymce.activeEditor.dom.create('p');
		var targetNode = currentSelectedNode;

		// Only want to insert extra p tags if a user's cursor is within a tm-element or video element
		if (!currentSelectedNode.classList.contains('tm-element') || !currentSelectedNode.classList.contains('video')) {
			targetNode = currentSelectedNode.closest('.tm-element');
			targetNode = isEmpty(targetNode) ? currentSelectedNode.closest('div.video') : targetNode;
		}

		if (isEmpty(targetNode))
			return false;

		tinymce.activeEditor.dom.insertAfter(pTag, targetNode);
	}

	/**
	 * Generate a table given the amount of rows that the user selected
	 * @param {int} rows
	 */
	function createTable(rows) {
		var tRow = '<tr class="row strow chrow">' +
					   '<td class="stentry choption"></td>' +
					   '<td class="stentry chdesc"></td>' +
				   '</tr>';
		var openTag = '<table class="simpletable choicetable choicetableborder tm-element"><tbody class="tbody">';
		var closeTag = '</tbody></table><p></p>';

		var result = '';

		for (var i = 0; i < rows; i++) {
			result += tRow;
		}

		return openTag + result + closeTag;
	}

	/**
	 * Genereate the htmltext for embedded videos. Uses Servicenow styles.
	 * @param {string} param
	 */
	function createVideoText(param) {
		return ( '<div class="video">' +
				 '<iframe src = "' + param.url + '" allowfullscreen="" frameborder="0"></iframe>' +
				 '<p class="p">' + getMessage(param.label) + '</p>' +
				 '</div><p></p>' );
	}

	// Find the specified child given the parent
	function findChild(parent, child) {
		var result = [];
		var children = parent.children;

		if (!isEmpty(children) && children.length !== 0) {
			for (var i = 0; i < children.length; i++) {
				if (children[i].tagName === child)
					result.push(children[i]);
			}
		}
		return result;
	}

	// Check if the current node has a list element as a parent
	function hasListParent(node) {
		var parent = node.parentNode;
		while (parent.tagName !== 'BODY') {
			if (parent.tagName === 'UL' || parent.tagName === 'OL') {
				return parent;
			}
			parent = parent.parentNode;
		}
		return false;
	}

	function isEmpty(element) {
		return element === null || element === undefined || element === '';
	}

}
