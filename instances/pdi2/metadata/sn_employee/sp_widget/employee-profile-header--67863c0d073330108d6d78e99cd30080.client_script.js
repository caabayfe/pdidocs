api.controller = function($scope, $element, snAttachmentHandler, i18n, spAriaUtil, spModal) {

    var c = this;
    c.profileDetails = c.data.profileDetails;
    c.backgroundBanner = "";
    $scope.secondaryFieldValues = [];

    c.getFormattedFieldValues = function() {
        if (c.profileDetails) {
            c.profileDetails.secondaryInfo.fields.forEach(function(field) {
                c.getTagForField(field);
                $scope.secondaryFieldValues.push(field);
            });
        }
    };
    c.getTagForField = function(field) {
        if (c.data.headerConfig.disableLinks)
            return true;
        var type = field.fieldType;
        switch (type) {
            case 'phone_number_e164':
                field.tag = "tel:" + field.fieldValue;
                break;
            case 'phone_number':
                field.tag = "tel:" + field.fieldValue;
                break;
            case 'ph_number':
                field.tag = "tel:" + field.fieldValue;
                break;
            case 'email':
                field.tag = "mailto:" + field.fieldValue;
                break;
            case 'url':
                field.tag = field.fieldValue;
                field.target = "_blank";
                break;
            default:
                break;
        }
    };

    c.getFormattedFieldValues();
    c.setProfileAvatar = function(avatarID) {
        if (avatarID) {
            if (c.profileDetails) {
                c.profileDetails.profile_picture = avatarID;
            }
            c.profilePic = {
                'background-image': "url('" + avatarID + ".iix')"
            };
        } else {
            if (c.profileDetails) {
                c.profileDetails.profile_picture = "";
            }
            c.profilePic = "";
        }
    };

    c.setBannerWithStyle = function(bannerID) {
        if (bannerID) {
            c.backgroundBanner = {
                'background-image': "url('" + bannerID + ".iix')",
                'background-position': "50% 50%"
            };
        }
    };

    var avatarID = c.profileDetails ? c.profileDetails.profile_picture : c.data.userDetails.profile_picture;
    c.setProfileAvatar(avatarID);

    if (!c.data.hasValidEmployeeRecord) {
        c.setBannerWithStyle(c.data.defaultBanner);
        return;
    }

    c.setBackgroundBanner = function(bannerID) {
        if (bannerID) {
            c.profileDetails.primaryInfo.backgroundBanner = bannerID;
            c.setBannerWithStyle(bannerID);
        } else {
            c.profileDetails.primaryInfo.backgroundBanner = "";
            if (c.data.defaultBanner) {
                c.setBannerWithStyle(c.data.defaultBanner);
            } else {
                c.backgroundBanner = "";
            }
        }
    };

    c.setBackgroundBanner(c.profileDetails.primaryInfo.backgroundBanner);

    c.deleteAttachment = function(attachmentSysId, attachmentType) {
        return snAttachmentHandler.deleteAttachment(attachmentSysId).then(function() {
            if (attachmentType === "cover") {
                c.setBackgroundBanner();
                c.server.get({
                    "action": "deleteBanner",
                    "userID": c.data.sysUserID
                }).then(function(res) {
                    spAriaUtil.sendLiveMessage(i18n.getMessage('Profile banner deleted successfully'));
                });
            } else if (attachmentType === "profile") {
                c.setProfileAvatar();
                c.server.get({
                    "action": "deleteProfile",
                    "userID": c.data.sysUserID
                }).then(function(res) {
                    spAriaUtil.sendLiveMessage(i18n.getMessage('Profile picture deleted successfully'));
                });
            }
        });
    };

    c.uploadNewPicture = function($event, id) {
        $event.stopPropagation();
        $event.preventDefault();
        var $el = $element.find('[id=' + id + ']');
        $el.click();
    };

    c.deleteBannerPopUp = function() {
        $scope.modalInstance = $uibModal.open({
            templateUrl: 'deleteBanner',
            scope: $scope,
            size: "xs",
            controller: function($scope, $uibModalInstance) {
                $scope.deleteBanner = function() {
                    c.closePopUp();
                    $uibModalInstance.close();
                    c.deleteAttachment(c.profileDetails.primaryInfo.backgroundBanner, "banner");
                };
                $scope.dismissModal = function() {
                    $uibModalInstance.close();
                    c.closePopUp();
                };
            }
        });
    };

    c.uploadImage = function($event, type, mode) {
        var description;
        var placeholderIcon;
        var broadcastId;
        var imgToProcess;
        var isCircularCrop;
        var imageType;
        var aspectRatio;
        var dragMode = "move";
        var isCropBoxMovable = false;
        var isCropBoxResizable = false;
        var viewMode;
        var autoCropArea;

        if (type === 'cover') {
            description = i18n.getMessage("This is a great place for your favorite team photo, or a place to show off furry friends and family members");
            placeholderIcon = "image";
            broadcastId = "sn_employee.backgroundBanner";
            imgToProcess = c.profileDetails.primaryInfo.backgroundBanner;
            isCircularCrop = false;
            aspectRatio = 4 / 1;
            viewMode = 3;
            autoCropArea = 1;
        } else {
            description = i18n.getMessage("Help teammates get to know you by showing them your best smile");
            placeholderIcon = "user-circle-o";
            broadcastId = "sn_employee.profilePicture";
            imgToProcess = c.profileDetails.profile_picture;
            isCircularCrop = true;
            aspectRatio = 1;
            viewMode = 0;
            autoCropArea = 0.6;
        }
        imgToProcess = imgToProcess.replace('url(', '').replace(')', '').replace(/\"/gi, "") + ".iix";
        imageType = type;
        spModal.open({
            size: "lg",
            backdrop: "static",
            widget: "employee-center-image-editor",
            widgetInput: {
                "description": description,
                "placeholderIcon": placeholderIcon,
                "broadcastId": broadcastId,
                "editorMode": mode,
                "imgToProcess": imgToProcess,
                "isCircularCrop": isCircularCrop,
                "imageType": imageType,
                "aspectRatio": aspectRatio,
                "dragMode": dragMode,
                "isCropBoxMovable": isCropBoxMovable,
                "isCropBoxResizable": isCropBoxResizable,
                "viewMode": viewMode,
                "autoCropArea": autoCropArea
            },
            buttons: []
        });
    };

    $scope.$on("sn_employee.preferredPronoun", function($evt, data) {
        c.profileDetails.primaryInfo.pronoun = data;
    });

    $scope.$on("sn_employee.backgroundBanner", function($evt, file) {
        if (file === null) {
            c.deleteAttachment(c.profileDetails.primaryInfo.backgroundBanner, "cover");
        } else {
            snAttachmentHandler.create("sn_employee_profile", c.profileDetails.primaryInfo.profileId).uploadAttachment(file, {
                sysparm_fieldname: "background_banner"
            }).then(function(response) {
                c.setBackgroundBanner(response.sys_id);
                spAriaUtil.sendLiveMessage(i18n.getMessage('Profile banner updated successfully'));
            });
        }
    });

    $scope.$on("sn_employee.profilePicture", function($evt, file) {
        if (file === null) {
            c.deleteAttachment(c.profileDetails.profile_picture, "profile");
        } else {
            snAttachmentHandler.create("live_profile", c.profileDetails.live_profile_id).uploadAttachment(file, {
                sysparm_fieldname: "photo"
            }).then(function(response) {
                c.setProfileAvatar(response.sys_id);
                spAriaUtil.sendLiveMessage(i18n.getMessage('Profile picture updated successfully'));
            });
        }
    });
};
