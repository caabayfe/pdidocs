var VAFaqUtil = Class.create();
VAFaqUtil.prototype = {
    initialize: function() {
		// lower bound for display_length to protect against very small values set in the sys property.
        this.min_display_length = 100;
        this.default_display_length = 400; // default display length of the snippet.
        this.anchor_tag_length = 4; // end anchor tag character [</a>] count.
    },
	
	buildHeaderText: function (kbNumber, selectedType) {
		// getting glide record
		var gr = new GlideRecord('kb_template_faq');
		gr.addQuery('number', kbNumber);
		gr.addQuery('latest', true); // An FAQ can have multiple versions but we always want the latest.
		gr.query();
		if (!gr.next()) {
			return '';
		}
		var questionText = gr.kb_question;
		var answerText = gr.kb_answer;

		// output
		var output = '';
		if (selectedType == 'multi') {
			output = questionText;
		}
		output += answerText;
		
		// trim whitespace before & after
		output = output.trim();
		
		// all links should open in new window
		output = output.replaceAll('<a ', '<a target=\"_blank\" ');
		
		var lengthStart = output.length;
		var pTagPresent = false;
		
		// Check if there is a paragraph tag wrapper and remove if there is one
		/* p tag wrapper will be automatically added if there 
		is no single parent node. However no p tag will be added if user creates a
		description as a ul or some other element natively wrapped in a single tag */
		if (output.indexOf("<p") === 0) {
			output = output.substr(3, lengthStart - 7);
			pTagPresent = true;
		}
		
		// Find text and text length without anchor tags or urls
		var textOnly = output; 
		var textLength = 0; 
		textOnly = textOnly.replace(/<a[^>]*>/g, '').replace(/<\/a>/g, '');
		textLength = textOnly.length;

		// We need to get the display_size sys_property to limit output characters diaplayed in bot response. Default value is 400.
        var display_size = gs.getProperty("com.glide.cs.faq.display_size", this.default_display_length);
        display_size = isNaN(display_size) ? this.default_display_length : parseInt(display_size); // Default to 400 in case of NaN value
        // ensure that display_length is at least 100 to have meaningful snippet.
        display_size = display_size > this.min_display_length ? display_size : this.min_display_length;
		
		// truncate if text is too long
		if (textLength > display_size) {
			var outputRemoveLeading = output; // Output without the leading tags
			var textTruncated = textOnly.substr(0, display_size);
			var tagCount = 0;
			
			// Count anchor tag characters in the output containing the truncated text
			while ((outputRemoveLeading.indexOf(textTruncated) !== 0)) { 
				if (outputRemoveLeading.match(/<a[^>]*>/)) {
					tagCount += outputRemoveLeading.match(/<a[^>]*>/)[0].length;
				}
				outputRemoveLeading = outputRemoveLeading.replace(/<a[^>]*>/, '');
				
				if (outputRemoveLeading.includes(textTruncated)||
				(outputRemoveLeading.indexOf(textTruncated) == 0)) {
					break;
				}
				if (outputRemoveLeading.match(/<\/a>/)) {
					tagCount += outputRemoveLeading.match(/<\/a>/)[0].length;
				}
				outputRemoveLeading = outputRemoveLeading.replace(/<\/a>/, '');
			}
			
			var subString = output.substr(0, display_size + tagCount);
			
			// Check if an anchor is interrupted and add some length to allow for it
			if ((subString.includes("<a") && subString.lastIndexOf("</a>") < subString.lastIndexOf("<a")) && 
			(output.substr(display_size, output.length).indexOf("</a>") !== -1 )) {
				
				// Increase character limit to ensure that the anchor tag is complete and link is honored.
				var subString2 = output.substr(display_size + tagCount, output.length);
				var firstEndAnchorIdx = subString2.indexOf("</a>");
				if (firstEndAnchorIdx != -1) {
					var extendedLength = display_size + tagCount + this.anchor_tag_length + firstEndAnchorIdx;
					
					// Only increase up to 100 characters
					if (this.anchor_tag_length + firstEndAnchorIdx < 100) {
						if (output.substr(0, extendedLength).length < output.length) {
							output = output.substr(0, extendedLength).trim() + "...";
						} else { 
							output = output.substr(0, extendedLength).trim();
						}
					} else {
						output = subString.trim() + "...";
					}
				}
			} else {
				subString.length < output.length ? output = subString.trim() + "..." : 
				output = subString.trim();
			}
		}
		
		//Put paragraph tags back on if they were present
		if (pTagPresent) {
			output = "<p>" + output + "</p>";
		}
		return output;
	},
	
    type: 'VAFaqUtil'
};
