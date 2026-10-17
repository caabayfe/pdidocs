var CollabRequestEmailScript = Class.create();
CollabRequestEmailScript.prototype = {
    initialize: function() {
		this.content = '';
		this.styles = {
			heading: "text-align: center; font-size: 24px; font-weight: 600;",
			paragraph: "margin-bottom: 24px;",
			textCenter: "text-align: center;",
			button: 'display: inline-block; border-radius: 100px; background-color: #3A57E9; padding: 10px 24px; color: white; text-decoration:none;',
			comment: "font-weight: 600; font-style: italic; padding: 0 40px;"
		};
    },
	addHeading: function(heading) {
		this.content += '<h1 style="' + this.styles.heading + '">' + heading + '</h1>';
	},
	addText: function(text, hasMarginBottom) {
		if (hasMarginBottom) {
			this.content += '<p style="' + this.styles.paragraph + '">' + text + '</p>';
		} else {
			this.content += '<p>' + text + '</p>';
		}
	},
	addButton: function(text, goToUrl) {
		if (goToUrl) {
			this.content += '<p style="' + this.styles.textCenter + '"><a style="' + this.styles.button + '" href="' + goToUrl + '">' + text + '</a></p>';
		}
	},
	addComment: function(comment) {
		this.content += '<p style="' + this.styles.paragraph + this.styles.comment + '">"' + comment + '"</p>';
	},
	getBody: function() {
		return '<style>* {font-family: Arial, sans-serif, "open sans"}</style><div style="font-family: Arial, sans-serif, "open sans" !important; color: #333E3F;">' + this.content + '</div>';
	},

    type: 'CollabRequestEmailScript'
};
