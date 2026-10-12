// <sc-toggle-data sn-data="HTML object" sn-limit="" sn-less-text="Read Less" sn-more-text="Read More"></sc-toggle-data>
function scToggleData(i18n, cabrillo) {
	"use strict";
	return {
		restrict: 'E',
		scope: {
			moreText: '@snMoreText',
			lessText: '@snLessText',
			limit: '<snLimit',
			data: '<snData'
			},

		template: '<now-message key="Show more" value="${Show more}"/>' +
				'<now-message key="Show less" value="${Show less}"/>',

		link: function(scope, elem) {
			var moreText = scope.moreText ||  i18n.getMessage('Show more');
			var lessText = scope.lessText || i18n.getMessage('Show less');

			var moreTextCmp = ' <a class="read-more">' + moreText + '</a>';
			var lessTextCmp = ' <a class="read-less">' + lessText + '</a>';

			if (cabrillo.isNative()) {
					moreTextCmp = ' <div style="display: flex;justify-content: center;align-items: center;" class="m-t"> <a class="btn btn-default read-more" role="button" aria-expanded="false" tabindex="0">' + moreText + '</a></div>';
					lessTextCmp = ' <div style="display: flex;justify-content: center;align-items: center;" class="m-t"> <a class="btn btn-default read-less" role="button" aria-expanded="true" tabindex="0">' + lessText + '</a></div>';
			}

			var limit = angular.isUndefined(scope.limit) || !scope.limit || scope.limit < 1 ? 150 : scope.limit;
			var text = angular.isUndefined(scope.data) ? '' : scope.data;
			var ellipsis = '<span aria-hidden="true">...</span>';

			var textHtml = String(text);
			var textNonHtml = textHtml.replace(/<([^>\s]*)[^>]*>/gm, '');
			var charCount = textNonHtml.length;

			if (charCount > limit && cabrillo.isNative())
				textHtml = htmlSubstring(textHtml, limit, ellipsis, moreTextCmp, lessTextCmp);

			elem.html(textHtml);
			elem.find('.read-more').on('click', function() {
				elem.find('.less-text').hide();
				elem.find('.more-text').show();
				elem.find('.read-less').focus();
				});

			elem.find('.read-less').on('click', function() {
				elem.find('.more-text').hide();
				elem.find('.less-text').show();
				elem.find('.read-more').focus();
				});

			function htmlSubstring(textHtml, limit, ellipsis, moreText, lessText) {
				var tags;
				var tagFinder = /<([^>\s]*)[^>]*>/gm;
				var stack = [];
				var lastTagIndex = 0;
				var result = '';

				//finding tag in each line
				while ((tags = tagFinder.exec(textHtml)) && limit) {
					//get the text between previous iteration tag-end index and current iteration tag-start index.
					var temp = textHtml.substring(lastTagIndex, tags.index).replace(/\s\s+/g,'').substr(0, limit);
					result += temp;
					limit -= temp.length;
					lastTagIndex = tagFinder.lastIndex;	//updating last-index of current iteration

					if (limit) {
						result += tags[0];
						if (tags[1].indexOf('/') === 0)
							stack.pop();
						else if (tags[1].lastIndexOf('/') !== tags[1].length-1)
							stack.push(tags[1]);
					}
				}

				result += ellipsis;
				//fix the unclosed tags
	    	    while (stack.length) {
	    	    	result += '</' + stack.pop() + '>';
	    	    	}
				result += moreText;

	    	    result = '<span class="less-text">' + result +  '</span><span class="more-text" tabindex="-1">' + textHtml + lessText + '</span>';
	    	    return result;

			}
		}
	};

}
