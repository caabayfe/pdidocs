api.controller = function($uibModal, $window, $scope, $timeout) {

    /* widget controller */
    var c = this;
    c.MOBILE_WIDTH = 600;
    c.VISIBILITY_TEMPLATE = "profile-widget-visibility";
    c.intialize = function() {
        c.isMobileDevice = $window.innerWidth < c.MOBILE_WIDTH || c.data.isMobile;
        c.initialVisibility = c.data.widgetVisibility;
        c.currentVisibility = c.data.widgetVisibility;
        c.lockIcon = c.data.accessibilityMsg && c.data.accessibilityMsg === "only you" ? "fa fa-lock" : "fa fa-unlock";
        c.isModalOpen = false;
        c.isPopoverOpen = false;
    };

    c.openModal = function() {
        c.modalInstance = $uibModal.open({
            templateUrl: c.VISIBILITY_TEMPLATE,
            scope: $scope,
            backdrop: 'true'
        });
        c.isModalOpen = true;
        $timeout(c.removeSearch, 100);
    };

    c.openPopover = function() {
        c.isPopoverOpen = true;
        $timeout(c.removeSearch, 100);
    };

    c.removeSearch = function() {
        $('select.visibility-select-dropdown').select2({
            minimumResultsForSearch: -1
        });
        //Fix overlapping of dropdown menu.
        $('.visibility-select-dropdown .select2-drop').css({
            "margin-top": "1.5px"
        });
        //Fix the accessibility issue.
        $(".visibility-select-dropdown input.select2-focusser").attr("aria-expanded", "false");
        $(".visibility-select-dropdown a.select2-choice").attr("aria-hidden", "true");
        $('select.visibility-select-dropdown').parent().find('input[type="text"]').attr('aria-expanded', false);
        $('div.visibility-select-dropdown').children('input').attr('aria-expanded', false);
    };

    c.close = function() {
        if (c.modalInstance) {
            c.modalInstance.close();
        }
        c.isPopoverOpen = false;
        c.isModalOpen = false;
        c.currentVisibility = c.initialVisibility;
    };

    c.savePreference = function() {
        if (c.initialVisibility != c.currentVisibility) {
            c.server.get({
                "action": "SAVE_PREFERENCE",
                "visibility": c.currentVisibility,
                'options': c.data.options
            }).then(function(response) {
                c.data = response.data;
                c.close();
                c.intialize();
                var updatedVisibilityPreferences = {
                    accessibilityMsg: c.data.accessibilityMsg,
                    widgetMappingId: c.data.widgetMappingId,
                    widgetVisibility: c.data.widgetVisibility
                };
                $scope.$emit('updateWidgetVisibility', updatedVisibilityPreferences);
            });
        } else {
            c.close();
        }
    };

    c.intialize();
};
