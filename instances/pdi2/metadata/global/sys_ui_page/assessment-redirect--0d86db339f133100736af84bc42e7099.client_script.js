function extractHostname(url) {
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("//") > -1)
        hostname = url.split('/')[2];
    else
        hostname = url.split('/')[0];

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}

// For security issue, we need to control the domain and redirect to "assessment_take2.do" ui page. If url is trying to redirect to external domain, we will force to redirect to "assessment_list.do" page.
var unwrapped_url = "$[JS:jvar_unwrapped_url]";
var urlWithoutProtocol = unwrapped_url.replace(/(^\w+:|^)\/\//, '');// remove url protocols like "https://, http://"
var redirect_page = extractHostname(urlWithoutProtocol);
if (redirect_page === 'assessment_take2.do')
	document.location.href = urlWithoutProtocol;
else
	document.location.href = "assessment_list.do";
