function($scope) {
  /* widget controller */
  var c = this;

	c.config = {
		outputType: "encoded_query",
		closeFilter: true,
		encodedQuery: massageEncodedQuery(c.data.initialQuery),
		manageFiltersLink: "?id=lf&table=sys_filter"
	};

	function massageEncodedQuery(encodedQuery) {
		return (encodedQuery) ? encodedQuery.replace(/CONTAINS/g, "LIKE").replace(/DOES NOT CONTAIN/g, "NOT LIKE") : encodedQuery;
	}

    function updatePolarisCss() {
        var filePathToSearch = '/styles/filter.css';
        var filePathToUpdate = '/styles/polaris/filter.css?v=' + g_builddate;
        var linkElement = document.querySelector("link[href*='" + filePathToSearch + "']")
        if (linkElement && linkElement.href) {
            linkElement.href = filePathToUpdate;
        }
    }

    if (window.NOW.sp.uxfThemeEnable) {
        setTimeout(updatePolarisCss);
    }
}
