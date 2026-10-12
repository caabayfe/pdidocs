document.title = '${gs.getMessage("Download MID Server | ServiceNow")}';
    function downloadPackage(packName, event) {
	if(event !== undefined) {
		event = event || window.event;
		event.preventDefault();
	}

    var uri = getDownloadURL(packName);

    // Using direct download from install.service-now.com
    if (uri.indexOf('http') == 0) {
        window.location.href = uri;
        return;
    }

    // Download through the attachment
    $j.ajax({
        url: uri,
        type: "GET",
        beforeSend: function(xhr) {
            xhr.setRequestHeader('X-UserToken', window.g_ck);
        },
        success: function(data) {
            window.location = window.location.protocol + '//' + window.location.host + '/sys_attachment.do?sys_id=' + data.result;

        }
    });
}

function copyDownloadLink(packName, event) {
    if(event !== undefined) {
        event = event || window.event;
        event.preventDefault();
    }

    var uri = getDownloadURL(packName);

    var tempInput = document.createElement("input");
    tempInput.value = uri;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
}

function getDownloadURL(packName) {
    var midPackages = JSON.parse($('mid_packages').value);
    var uri = midPackages[packName].uri;

    //Update suffix for signature links
    if (packName == 'linux64RPMSign')
        uri = uri.replace('.rpm', '-rpm.zip');
    else if (packName == 'linux64DEBSign')
        uri = uri.replace('.deb', '-deb.zip');

    return uri;
}

function useZipClicked(useZipCheckbox) {
    if (useZipCheckbox.checked)
		document.getElementById('ZIPDIV').style.display = 'block';
    else
		document.getElementById('ZIPDIV').style.display = 'none';
}

function useDockerClicked(useDockerCheckbox) {
    if (useDockerCheckbox.checked)
		document.getElementById('DOCKERDIV').style.display = 'block';
    else
		document.getElementById('DOCKERDIV').style.display = 'none';
}
