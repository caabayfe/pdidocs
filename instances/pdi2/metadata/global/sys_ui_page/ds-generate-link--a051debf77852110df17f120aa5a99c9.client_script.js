var docId = g_form.getUniqueValue();
var dataOnServer = {}; // Updated after response from the server.
var permalinkState = {}; // For UI changes.

function updateLinkState(params) {
    for (var prop in params) {
        if (params.hasOwnProperty(prop))
            permalinkState[prop] = params[prop];
    }
}

function onExpiryChange(selectedObject) {
    if (selectedObject.value === 'expire_link_on') {
        var calculatedDate = dataOnServer.expiration || getDateWithFormat();
        updateLinkState({
            expiration: calculatedDate
        });
        setExpirationValue(calculatedDate);
        document.querySelector('.expiry-date').removeClassName('hidden');
    } else if (selectedObject.value === 'permanent') {
        document.querySelector('.expiry-date').addClassName('hidden');
        updateLinkState({
            expiration: ''
        });
    }
}

function getDateWithFormat() {
    return document.querySelector('.date-value').innerText;
}

function getExpirationValue() {
    return document.querySelector('.expiry-date input').value;
}

function setExpirationValue(date) {
    document.querySelector('.expiry-date input').value = date;
}

// Getting and setting link value in the link field.
function setLinkValue(link) {
    document.querySelector('.generated-link input').value = link;
}

function getLinkValue() {
    return document.querySelector('.generated-link input').value;
}

function getLinkType() {
    return document.querySelector('#expiry-type').value;
}

function makeLinkPermanent() {
    document.querySelector('#expiry-type').value = 'permanent';
    document.querySelector('.expiry-date').addClassName('hidden');
}

// For showing notifications
function showNotificationInfo(message) {
    document.querySelector('.notify-permalink .outputmsg_info .outputmsg_text').innerText = message;
    document.querySelector('.notify-permalink .outputmsg_info').removeClassName('hidden');
    document.querySelector('.notify-permalink').removeClassName('hidden');
    setTimeout(function() {
        document.querySelector('.notify-permalink').addClassName('hidden');
        document.querySelector('.notify-permalink .outputmsg_info').addClassName('hidden');
    }, 2000);
}

function showNotificationError(message) {
    document.querySelector('.notify-permalink .outputmsg_error .outputmsg_text').innerText = message;
    document.querySelector('.notify-permalink .outputmsg_error').removeClassName('hidden');
    document.querySelector('.notify-permalink').removeClassName('hidden');
    setTimeout(function() {
        document.querySelector('.notify-permalink').addClassName('hidden');
        document.querySelector('.notify-permalink .outputmsg_error').addClassName('hidden');
    }, 2000);
}

// Deleting the link
function deleteLink() {
    var createConfirmation = new GlideModal("ds_link_confirmation");
    createConfirmation.setTitle(getMessage("Delete Link?"));
    createConfirmation.setPreference("sysparm_view", "deleteLink");
    createConfirmation.render();
}

function proceedWithDeleteLink() {
    var deleteAjaxHelper = new GlideAjax('DocumentPermalinks');
    deleteAjaxHelper.addParam('sysparm_name', 'deleteLink');
    deleteAjaxHelper.addParam('sys_id', permalinkState.sys_id);
    deleteAjaxHelper.getXML(function(res) {
        var resJson = res.responseXML.documentElement.getAttribute("answer");
        var data = JSON.parse(resJson);
        if (data.success) {
            GlideModal.prototype.get('ds_link_confirmation').destroy();
            GlideModal.prototype.get('ds_generate_link').destroy();
            g_form.addInfoMessage(getMessage("The document link has been deleted. Click on ‘Share Document’ to create a new link."));
        } else {
            GlideModal.prototype.get('ds_link_confirmation').destroy();
            showNotificationError(getMessage("Error in deleting the link."));
        }
    });
}

// Updating the link
function onClickOk() {
    var isValid;
    if (getLinkType() !== 'permanent')
        isValid = validateDate();
    if (getLinkType() === 'permanent' || isValid) {
        var updateAjaxHelper = new GlideAjax('DocumentPermalinks');
        updateAjaxHelper.addParam('sysparm_name', 'update');
        updateAjaxHelper.addParam('doc_id', docId);
        updateAjaxHelper.addParam('sys_id', permalinkState.sys_id);
        updateAjaxHelper.addParam('type', permalinkState.type);
        updateAjaxHelper.addParam('access_type', permalinkState.access_type);
        updateAjaxHelper.addParam('expiration', permalinkState.expiration);
        updateAjaxHelper.addParam('active', 'true');
        updateAjaxHelper.getXML(function(res) {
            var resJson = res.responseXML.documentElement.getAttribute("answer");
            var data = JSON.parse(resJson);
            if (data.success) {
                dataOnServer = data;
                GlideModal.prototype.get('ds_generate_link').destroy();
                g_form.addInfoMessage(getMessage("Link updated successfully."));
            } else {
                showNotificationError(getMessage("Error in updating the link."));
            }
        });
    }
}

// Getting link details initially when popup is shown.
function getLinkDetails() {
    var getAjaxHelper = new GlideAjax('DocumentPermalinks');
    getAjaxHelper.addParam('sysparm_name', 'getLinks');
    getAjaxHelper.addParam('doc_id', docId);
    getAjaxHelper.getXML(function(res) {
        var resJson = res.responseXML.documentElement.getAttribute("answer");
        var permalinkObj = JSON.parse(resJson);
        dataOnServer = permalinkObj;
        updateLinkState(permalinkObj);
    });
}

function copyLink() {
    navigator.clipboard.writeText(getLinkValue());
    showNotificationInfo(getMessage("Link copied to clipboard."));
}

function validateDate() {
    var date = permalinkState.expiration;
    isValid = isValidDate(date);
    if (!isValid)
        document.querySelector('.expiry-date .fieldmsg-container').removeClassName('hidden');
    else
        document.querySelector('.expiry-date .fieldmsg-container').addClassName('hidden');
    return isValid;
}

function isValidDate(dateString) {
    var date_format = document.querySelector('.date-format').innerText;
    if (getDateFromFormat(dateString, date_format) === 0) return false;
    var today = new Date(); // Returns today
    var d = new Date(getDateFromFormat(dateString, date_format)); // Selected date
    d.setHours(10, 0, 0, 0); // Setting same time for expiry date and
    today.setHours(10, 0, 0, 0); // Today date to compare both
    return d >= today;
}

getLinkDetails();

// Valide date when the user clicks outside the date.
document.querySelector('.expiry-date .input-group input').addEventListener('blur',
    function() {
        updateLinkState({
            expiration: getExpirationValue()
        });
        validateDate();
    });
