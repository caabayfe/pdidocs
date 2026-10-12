var AesEmailScript = Class.create();
AesEmailScript.prototype = {
    initialize: function() {},
    getStyles: function() {
        return {
            container: "font-family:  Open Sans, Arial, sans-serif;",
            main: "padding-bottom: 56px;",
            center: "text-align: center;",
            header: "font-size: 24px;",
            content: "padding-right: 10%; padding-left: 10%; line-height: 20px;",
            message: "color: #3C3C3C; font-size: 15px;",
            row: "display: table; width:100%;",
            label: "display: table-cell;  width: 20%; padding: 10px 10px 10px 0;",
            labelValue: "display: table-cell; width: 70%; padding: 10px 10px 10px 0;",
            link: "color: #01778E",
            footer: "width: 100%; background-color: #2A3E40; color: #FFFFFF; padding-top: 20px; font-size: 12px; line-height: 20px;  height: 56px;",
        };
    },
    getBody: function(userName, headerMessage, bodyMessage, footerMessage) {
        var body = '<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@600&display=swap" rel="stylesheet">';
        var style = this.getStyles();
        var imageName = "servicenow_logo.svg";
        var trailingSlashRegex = /\/+$/;
        var instanceUrl =
            gs.getProperty("glide.servlet.uri") &&
            gs.getProperty("glide.servlet.uri").replace(trailingSlashRegex, "");
        var currentDateTime = new GlideDateTime(); // Current DateTime
        var currentYear = currentDateTime.getYearUTC();
        var dbImages = new GlideRecord("db_image");
        var imageUrl =
            instanceUrl && dbImages.get("name", imageName) ?
            instanceUrl + "/" + dbImages.getDisplayValue("image") :
            undefined;
        var footer = '<div style="' + style.center + '">' + footerMessage + '</div>';

		footer += gs.getMessage('{0}{1} ServiceNow | All Rights Reserved{2}', ['<div style="' + style.center + '">&copy; ' , currentYear, '</div>']);
        body += '<div style="' + style.container + '">';
        body += '<div style="' + style.main + '">';
        body += imageUrl ? '<div style="' + style.center + '"><img src="' + imageUrl + '"/></div>' : '';
        body += '<br /><br />';
        body += '<div style="' + style.content + '">';
        body += '<div style="' + style.header + '"><strong>' + headerMessage + '</strong></div>';
        body += '<br /><br />';
        body += '<div style="' + style.message + '">';
        body += '<div>' + gs.getMessage('Hi {0},', userName) + '</div>';
        body += '<br />';
        body += bodyMessage;
        body += '<br />';
        body += '<div>' + gs.getMessage('Thank you,') + '</div>';
        body += '<div>' + gs.getMessage('Your IT team') + '</div>';
        body += '</div>';
        body += '</div>';
        body += '</div>';
        body += '<div style="' + style.footer + '">' + footer + '</div>';
        body += '</div>';

        return body;
    },
	getTrailingSlashRegex: function() {
		return /\/+$/;
	},

    type: "AesEmailScript",
};
