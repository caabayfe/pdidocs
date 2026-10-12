addLoadEvent(function() {
    loadContent();
	setCountDown();
});

function loadContent() {
    var ajax = new GlideAjax("GlideDeviceRegistration");
    ajax.addParam("sysparm_name", "loadPopupContent");
    ajax.getXML(this.processContent.bind(this));
}

function processContent(response) {
    var result = response.responseXML.getElementsByTagName("result");
    if (result && result.length > 0) {
        var validated = result[0].getAttribute("validated");
        var qrCodeURL = result[0].getAttribute("qrCodeURL");
        var qrCodeText = result[0].getAttribute("qrCodeText");
        var appID = result[0].getAttribute("app_id");
        gel('lblID').innerHTML = appID;
        var registrationTime = result[0].getAttribute("registrationTime");
        gel('registrationTime').value = registrationTime;
        gel('imgCode').src = qrCodeURL;
        gel('lblCode').innerHTML = qrCodeText;
        gel("divNotification").style.display = "none"; //First time display
        gel("device_setup_instruction").style.display = "flex";
        gel("footer").style.display = "block";
        setTimeout(function() {
            var ajax = new GlideAjax("GlideDeviceRegistration");
            ajax.addParam("sysparm_name", "pollRegistration");
            ajax.addParam("sysparm_app_id", appID);
            ajax.getXMLWait();
            var isRegistered = ajax.getAnswer();
            if (isRegistered == 'false' || isRegistered == "") {
               gel("divDeviceDocNotification").style.display = "block";
            } else {
                gel("divNotification").style.display = "block";
                gel("divNotification").innerText = new GwtMessage().getMessage("Device has been successfully registered");
            }
        }, 60000);
    }
}

function closeDialog() {
    GlideDialogWindow.get().destroy();
    window.location.reload();
}

document.addEventListener('click', function(e) {
    if (e.target.matches('[data-dismiss="GlideModal"]')) {
        location.reload();
    }
});

function setCountDown() {
    var countDownTimeInMins = gel('countDownTimeInMins').value;
    var countDownDate = new Date().getTime() + countDownTimeInMins * 60 * 1000;
    var x = setInterval(function() {
        var current_time = new Date().getTime();
        var time_left = countDownDate - current_time;
        var minutes = Math.floor((time_left % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((time_left % (1000 * 60)) / 1000);
        minutes = checkTime(minutes);
        seconds = checkTime(seconds);
        document.getElementById("countdown").innerText = new GwtMessage().getMessage("Time Left : 00:{0}:{1}",minutes,seconds);

        if (time_left < 0) {
            clearInterval(x);
            GlideDialogWindow.get().destroy();
        }
    }, 1000);
}

function checkTime(i) {
        return (i < 10) ? "0" + i : i;
    }
