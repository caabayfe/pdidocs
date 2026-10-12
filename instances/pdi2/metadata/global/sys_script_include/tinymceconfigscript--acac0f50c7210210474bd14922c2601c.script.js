var TinymceConfigScript = Class.create();
TinymceConfigScript.prototype = {
    initialize: function() {
    },
	setTinymceConfig: function() {
	var tinyConfig = {
		menubar: 'edit format',
		menu: {
			file: { title: 'File', items: 'importword exportpdf exportword | print | deleteallconversations' },
			edit: { title: 'Edit', items: 'undo redo | cut copy paste pastetext | selectall | searchreplace' },
			view: { title: 'View', items: 'code revisionhistory | visualaid visualchars visualblocks | spellchecker | preview fullscreen | showcomments' }
		},
		style_formats: [
			{ title: 'Headings', items: [
				{ title: 'Heading 1', format: 'h1' },
				{ title: 'Heading 2', format: 'h2' },
				{ title: 'Heading 3', format: 'h3' },
				{ title: 'Heading 4', format: 'h4' },
				{ title: 'Heading 5', format: 'h5' },
				{ title: 'Heading 6', format: 'h6' }
			]},
			{ title: 'Inline', items: [
				{ title: 'Bold', format: 'bold' },
				{ title: 'Italic', format: 'italic' },
				{ title: 'Underline', format: 'underline' },
				{ title: 'Strikethrough', format: 'strikethrough' },
				{ title: 'Superscript', format: 'superscript' },
				{ title: 'Subscript', format: 'subscript' },
				{ title: 'Code', format: 'code' }
			]},
			{ title: 'Blocks', items: [
				{ title: 'Paragraph', format: 'p' },
				{ title: 'Blockquote', format: 'blockquote' },
				{ title: 'Div', format: 'div' },
				{ title: 'Pre', format: 'pre' }
			]},
			{ title: 'Align', items: [
				{ title: 'Left', format: 'alignleft' },
				{ title: 'Center', format: 'aligncenter' },
				{ title: 'Right', format: 'alignright' },
				{ title: 'Justify', format: 'alignjustify' }
			]}
		]
	};
	return tinyConfig;
},
getConfiguration: function() {
	var config = this.setTinymceConfig();
	answer = JSON.parse(JSON.stringify(config));
},

    type: 'TinymceConfigScript'
};
