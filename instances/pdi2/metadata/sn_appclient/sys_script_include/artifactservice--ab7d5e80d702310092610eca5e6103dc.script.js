var ArtifactService = Class.create();
ArtifactService.prototype = {
    initialize: function(repo_base_url, repo_username, repo_password) {
		this.repo_base_url = repo_base_url;
		this.repo_username = repo_username;
		this.repo_password = repo_password;
    },
	
	authenticate: function() {
		var responseString = this._get("maven-metadata.xml");
		if (gs.nil(responseString))
			responseString = this._get("");
		var success = !gs.nil(responseString);
		return success;
	},
	
	getArtifacts: function(groupId) {
		var answer = [];	
		var groupPath = this._getGroupRelativePath(groupId);
		var candidates = this._getHTML(groupPath, true).data||[];
		for (var i = 0; i < candidates.length; i++) {
			var item = candidates[i];
			var artifactId = item.text;
			answer.push(artifactId);
		}
		answer.sort();
		return answer;
	},
	
	getArtifactVersions: function(groupId, artifactId) {
		var answer = [];	
		var artifactPath = this._getGroupRelativePath(groupId) + "/" + artifactId;
		var metaUrl = artifactPath + "/maven-metadata.xml";
		var responseString = this._getXML(metaUrl);
		if (gs.nil(responseString))
			return answer;

		var metaXml = new XMLDocument2();
		metaXml.parseXML(responseString);


	  var versions = [];
        var nodeIterator = metaXml.getNode('/metadata/versioning/versions').getChildNodeIterator();
        while (nodeIterator.hasNext()) {
            var nodeValue = nodeIterator.next().getTextContent();
            if (!gs.nil(nodeValue) && !nodeValue.startsWith("\n"))
                versions.push(nodeValue);
        }
        return versions;

    },
    getResourceURI: function(groupId, artifactId, artifactVersion) {
        gs.info("ArtifactService:getResourceURI " + this.repo_base_url);
        var answer = [];
        var version;
        if (this.repo_base_url.endsWith("/dev"))
            version = this._getSnapshotVersion(groupId, artifactId, artifactVersion);
        else
            version = this._getReleaseVersion(groupId, artifactId, artifactVersion);
        answer.push(version);
        return answer;
    },

	_getSnapshotVersion: function(groupId, artifactId, snapshotVersion) {
		var artifactPath = this._getGroupRelativePath(groupId) + "/" + artifactId;
		var versionPath = artifactPath + "/" + snapshotVersion + "/maven-metadata.xml";
		var responseString = this._getXML(versionPath);
		if (gs.nil(responseString))
			return null;

		var metaXml = new XMLDocument2();
		metaXml.parseXML(responseString);

		// 6.0.0.0-20150131.020405-59
		var snapshotBuild = metaXml.getNodeText('/metadata/versioning/snapshotVersions/snapshotVersion[classifier/text()="app"]/value');
		if (gs.nil(snapshotBuild))
			return null;

		var artifactFileName = artifactId + "-" + snapshotBuild + "-app.zip";
		var resourceURI = this._getServiceUrl(artifactPath + "/" + snapshotVersion + "/" + artifactFileName);
		return { text: snapshotVersion + " [" + snapshotBuild + "]", version: snapshotBuild, resourceURI: resourceURI, fileName: artifactFileName };
	},

	_getReleaseVersion: function(groupId, artifactId, releaseVersion) {
		var artifactPath = this._getGroupRelativePath(groupId) + "/" + artifactId;
		var versionPath = artifactPath + "/" + releaseVersion;
		var releaseItems = this._getHTML(versionPath, false).data||[];

		var resourceURI, lastModified, fileName;
		for (var i = 0; i < releaseItems.length; i++) {
			var releaseItem = releaseItems[i];
			if (releaseItem.text.endsWith("-app.zip")) {
				resourceURI = releaseItem.resourceURI;
				lastModified = releaseItem.lastModified;
				fileName = releaseItem.text;
				break;
			}
		}

		if (gs.nil(resourceURI))
			return null;

		return { text: releaseVersion + " [" + lastModified + "]", version: releaseVersion, resourceURI: resourceURI, fileName: fileName };
	},

	_getGroupRelativePath: function(groupId) {
		if (gs.nil(groupId))
			return "";

		return groupId.replace(/\./g, "/");
	},

	_get: function(relativePath) {
		var url = this._getServiceBrowseUrl(relativePath);
		var http = this._createHttpRequest();
		return this._doHttpGet(http, url);
	},

	_getXML: function(relativePath) {
		var url = this._getServiceUrl(relativePath);
		var http = this._createHttpRequest();
		return this._doHttpGet(http, url);
	},

	_getJSON: function(relativePath) {
		var url = this._getServiceUrl(relativePath);
		var http = this._createHttpRequest();
		http.addHeader("accept", "application/json");
		var responseString = this._doHttpGet(http, url);
		var obj = gs.nil(responseString) ? {} : new global.JSON().decode(responseString);
		return obj;
	},

	/**
	 * @deprecated
	 * Nexus V3's JSON REST API does not meet our requirements. Parsing HTML for now.
	 */
	_getHTML: function(relativePath, isDirectory) {
		// hit the /browse/ endpoint for the given relative path
		// (e.g. https://artifact.devsnc.com/service/rest/repository/browse/stable/com/snc/ae-gen-ai/28.2.2)
		var url = this._getServiceBrowseUrl(relativePath);
		var http = this._createHttpRequest();
		http.addHeader("accept", "text/html");
		var responseString = this._doHttpGet(http, url);

		try {
			var results = [];

			// break up the result into rows, beginning with the first column
			var rows = responseString.split('<td><a href="');

			// skip the first split result, because it precedes the table's rows
			for (var i = 1; i < rows.length; i++) {
				// find the end of the opening <td> tag
				var linkColumn = rows[i].split('">');
				if (linkColumn.length < 2) continue;

				// store the td's nested <a> href
				var resourceURI = linkColumn[0];
				if (resourceURI.endsWith('/') !== isDirectory) continue;

				// store the td's nested <a> innerText
				var text = linkColumn[1].split('</a>')[0];

				// find the second column's opening <td> tag
				var lastModified = rows[i].split('<td>')
				if (lastModified.length < 2) continue;

				// store the second column's innerText
				lastModified = lastModified[1].split('</td>')[0].trim();

				// all lights are green, push the valid result to the array
				results.push({
					text: text,
					resourceURI: resourceURI,
					lastModified: lastModified,
				});
			}

			// return valid results
			return { data: results };
		} catch (e) {
			// return error message to client
			return { data: [ { text: JSON.stringify(e) } ] };
		}
	},

	_doHttpGet: function(http, url) {
		var answer = null;
		var responseString = http.get(url);
		if (http.getStatusCode() == 200) {
			answer = responseString;
			gs.info("GET " + http.getStatusCode() + " " + url + " >> response length: " + (responseString||'').length);
		} else {
			gs.error("GET " + http.getStatusCode() + " " + url + " >> " + http.getErrorMessage());		
		}
		return answer;
	},
	
	_getServiceUrl: function(relativePath) {
		var url = this._getServiceBrowseUrl(relativePath);
		url = url.replace("service/rest/", "");
		url = url.replace("browse/", "");
		return url;
	},

	_getServiceBrowseUrl: function(relativePath) {
		if (relativePath.startsWith("http"))
			return relativePath;

		var url = this.repo_base_url||"https://artifact.devsnc.com";
		if (gs.nil(relativePath))
			return url;

		if (!relativePath.startsWith("/"))
			url += "/";
		return url + relativePath;
	},

	_createHttpRequest: function() {
		var http = new ScopedAppRepoRequest().getGlideHttpUtil();
		http.setBasicAuth(this.repo_username, this.repo_password);
		return http;
	},
	
    type: 'ArtifactService'
};
