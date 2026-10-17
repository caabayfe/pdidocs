function($scope, $timeout, $location, spAnnouncement, spUtil, spAriaUtil) {
  var c = this;

	c.wid = 'spw-announcements-' + new Date().getTime();
	c.accessibilityOff = spAriaUtil.g_accessibility === 'false';
	c.announcements = [];
	c.totalAnnouncements = 0;

	c.toggleDetails = function(announcement) {
		announcement.expanded = !announcement.expanded;
	};

	c.isViewAllPage = function() {
		return $location.search().id === c.options.view_all_page;
	};

	c.getNumArray = function(number) {
		return new Array(number);
	};

	c.getPageInfo = function() {
		var limit = parseInt(c.options.max_records, 10);
		var offset = (c.currentPage - 1) * limit;
		var end = offset + limit;

		return spUtil.format(c.data.rowsMessage, {
			'0': offset + 1,
			'1': end < c.totalRecords ? end : c.totalRecords,
			'2': c.totalRecords
		});
	};

	c.goToPage = function(page, firstLoad) {
		var result = spAnnouncement.get(spAnnouncement.filterOnType(c.options.type), c.options.max_records, page);

		c.currentPage = page;
		c.totalPages = result.totalPages;
		c.totalRecords = result.totalRecords;

		c.announcements = result.data;
		c.totalAnnouncements = result.data.length;
		
		c.announcements.forEach(function(a) {
			a.canExpand = a.summary || a.targetLinkText;
			a.expanded = false;
		});

		$(document).ready(function() {
			if (!firstLoad)
				setFocus();
		});
	};

	c.linkSetup = function(a) {
    a.linkTarget = '_self';

    if ('urlNew' === a.clickTarget) {
      a.linkTarget = '_blank';
    }

    a.linkType = !a.targetLink ? 'none' : a.targetLinkText ? 'normal' : 'title';
  };
	
	c.getDisplayStyle = function(announcement) {
		return announcement.displayStyle || {
			backgroundColor: '#006ed5',
			foregroundColor: '#ffffff',
			alignment: 'LEFT'
		};
	};

	function setFocus() {
		var ul = $('.' + c.wid).find('ul');

		if (!ul.length) {
			$timeout(setFocus);
			return;
		}

		$timeout(function() {
			ul.first().focus();
		}, 20);
	}

	c.goToPage(1, true);
}
