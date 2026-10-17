var app = angular.module("sn.change_request.risk_assessment_details", ["sn.common", "ui.bootstrap", "ui.bootstrap.popover", ])
    .constant("RISK_ASSESSMENT_DETAILS", {
        KEYS: {
            TABKEY: 9,
            ESCAPE: 27
        },
        FORM: {
            POPOVER: "chg_risk_assessment_ml_results",
            MODAL: "chg_risk_details",
        },
    })
    .constant("CHANGE_RISK_DETAILS", {
        EVALUATORS: {
            RISK_CONDITION: "risk_condition",
            LEGACY_RISK_ASSESSMENT: "legacy_risk_assessment",
            RISK_ASSESSMENT: "risk_assessment",
            RISK_ML: "risk_ml",
            RISK_SCORE: "calculated_risk_score"
        }
    })
    .config(function($locationProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false,
        });
    })
    .service("snRiskDetailsService", function() {
        var snRiskDetailsService = this;
        snRiskDetailsService.normalizeKeyCode = function(evt) {
            evt.charCode = evt.charCode === 0 ? evt.keyCode : evt.charCode;
            return evt;
        };
        snRiskDetailsService.getTabbableElements = function(elem) {
            var include = "button:visible, [tabindex]:visible";
            var exclude = "[tabindex='-1'], [disabled='disabled']";
            if (this.tabbable && this.tabbable.hasOwnProperty("include"))
                include = this.tabbable.include;
            if (this.tabbable && this.tabbable.hasOwnProperty("exclude"))
                exclude = this.tabbable.exclude;
            return elem.find(include).not(exclude);
        };
    })
    .directive("snRiskDetails", function(i18n, getTemplateUrl, $location, $window, $timeout, RISK_ASSESSMENT_DETAILS, CHANGE_RISK_DETAILS, snRiskDetailsService) {
        "use strict";
        return {
            replace: true,
            restrict: "E",
            templateUrl: getTemplateUrl("chg_risk_details.xml"),
            link: function($scope) {
                $scope.direction = $window.NOW.rtl;
                $scope.pluginsInstalled = $window.NOW.risk_details.pluginsInstalled;
                $scope.showViewDetails = $window.NOW.risk_details.show;
                $scope.data = $window.NOW.risk_details.data;
                $scope.chg_probability_data = $window.NOW.chg_probability_details.data;
                $scope.title = $window.NOW.risk_details.title;
                $scope.ml_review = $window.NOW.risk_details.ml_review;
                $scope.sys_id = $location.search().sysparm_changeId || $location.search().sysparm_chg_id;
                $scope.mode = $location.search().sysparm_mode;
                $scope.highestRisk = {
                    field: "",
                    label: "",
                    value: "",
                    display_value: ""
                };
                $scope.selected = function(columnName) {
                    return columnName === $scope.highestRisk.field;
                };
                $scope.hasConditionalRules = function() {
                    return isPluginInstalled("BestPractice") && isShowRiskType("BestPractice", CHANGE_RISK_DETAILS.EVALUATORS.RISK_CONDITION);
                };
                $scope.hasLegacyRiskAssessment = function() {
                    if (isPluginInstalled("RiskAsmt"))
                        return false;
                    return isPluginInstalled("LegacyRiskAsmt") && isShowRiskType("LegacyRiskAsmt", CHANGE_RISK_DETAILS.EVALUATORS.LEGACY_RISK_ASSESSMENT);
                };
                $scope.hasRiskAssessment = function() {
                    return isPluginInstalled("RiskAsmt") && isShowRiskType("RiskAsmt", CHANGE_RISK_DETAILS.EVALUATORS.RISK_ASSESSMENT);
                };
                $scope.hasMLResults = function() {
                    return isPluginInstalled("MlRisk") && isShowRiskType("MlRisk", "risk_ml");
                };
                $scope.hasCalculatedRiskScore = function() {
                    return isPluginInstalled("SuccessProbability") && isShowRiskType("CalculatedRiskScore", CHANGE_RISK_DETAILS.EVALUATORS.RISK_SCORE);
                };
                $scope.getConditionalRulesName = function() {
                    if ($scope.data.risk_condition && $scope.data.risk_condition.display_value)
                        return $scope.data.risk_condition.display_value;
                    return $scope.messages["No risk condition matches the current record"];
                };
                $scope.getConditionalRulesValue = function() {
                    if (hasRun(CHANGE_RISK_DETAILS.EVALUATORS.RISK_CONDITION) && $scope.data.risk_condition && $scope.data.risk_condition.display_value && !$scope.data.risk_condition_risk.display_value)
                        return $scope.messages["Not Set"];
                    else if (hasRun(CHANGE_RISK_DETAILS.EVALUATORS.RISK_CONDITION))
                        return $scope.data.risk_condition_risk.display_value || $scope.messages["No matching risk conditions"];
                    return $scope.messages["No matching risk conditions"];
                };
                $scope.getCalculatedRiskScoreValue = function() {
                    if (hasRun(CHANGE_RISK_DETAILS.EVALUATORS.RISK_SCORE) && !$scope.data.calculated_risk_score_risk && !$scope.data.calculated_risk_score_risk.display_value)
                        return $scope.messages["Not Set"];
                    else if (hasRun(CHANGE_RISK_DETAILS.EVALUATORS.RISK_SCORE))
                        return $scope.data.calculated_risk_score_risk.display_value || $scope.messages["Not Set"];
                    // Probability on change request record not set
                    return $scope.messages["Not Set"];
                };
                $scope.getCalculatedRiskScoreName = function() {
                    if (hasRun(CHANGE_RISK_DETAILS.EVALUATORS.RISK_SCORE) && $scope.chg_probability_data && $scope.chg_probability_data.probabilityType) {
                        return $scope.messages[$scope.chg_probability_data.probabilityType];
                    } else if (!hasRun(CHANGE_RISK_DETAILS.EVALUATORS.RISK_SCORE))
                        return $scope.messages["Calculated risk score failed"];
                    return $scope.messages["No probability condition matches the current record"];
                };

                $scope.getCalculatedRiskScoreStatus = function() {
                    return hasRun(CHANGE_RISK_DETAILS.EVALUATORS.RISK_SCORE);
                };

                $scope.getLegacyRiskAssessmentName = function() {
                    if (hasRun(CHANGE_RISK_DETAILS.EVALUATORS.LEGACY_RISK_ASSESSMENT))
                        return $scope.data.assessment_master.display_value;
                    return "";
                };
                $scope.getLegacyRiskAssessmentValue = function() {
                    if (hasRun(CHANGE_RISK_DETAILS.EVALUATORS.LEGACY_RISK_ASSESSMENT))
                        return $scope.data.legacy_risk_assessment.display_value || $scope.messages["No match / incomplete"];
                    return $scope.messages["No match / incomplete"];
                };
                $scope.getRiskAssessmentName = function() {
                    if (hasRun(CHANGE_RISK_DETAILS.EVALUATORS.RISK_ASSESSMENT))
                        return $scope.data.change_risk_asmt.display_value;
                    return "";
                };
                $scope.getRiskAssessmentValue = function() {
                    if (hasRun(CHANGE_RISK_DETAILS.EVALUATORS.RISK_ASSESSMENT))
                        return $scope.data.risk_assessment.display_value || $scope.messages["No match / incomplete"];
                    return $scope.messages["No match / incomplete"];
                };
                $scope.isMLReadOnly = function() {
                    return !$scope.data.risk_ml_set.value;
                };
                $scope.getRiskMLValue = function() {
                    if (hasRun("risk_ml"))
                        return $scope.data.risk_ml.display_value || $scope.messages["Unable to predict"];
                    return $scope.data.mlOptions.isEnabled ? $scope.messages["Unable to predict"] : $scope.messages["Disabled"];
                };
                $scope.cancel = function() {
                    setTimeout(function() {
                        new $window.parent.GlideModal()
                            .get(RISK_ASSESSMENT_DETAILS.FORM.MODAL)
                            .destroy();
                    }, 0);
                };
                $scope.getSelectedMessage = function() {
                    return $scope.messages["Selected risk type {0}"].withValues([$scope.highestRisk.label]);
                };
                init();

                function init() {
                    $scope.highestRisk = $scope.data.highestRisk;
                    $timeout(function() {
                        adjustHeight();
                    });
                }

                function adjustHeight() {
                    var _$j = $window.parent.$j;
                    var contentHeight = angular.element("html").height();
                    if ($scope.mode === "popover") {
                        var popover = _$j(".popover");
                        var popoverContent = _$j(".popover-content");
                        popoverContent.css("padding", "0");
                        popoverContent.css("overflow", "hidden");
                        // Adjust popover height once we know how many rows to display
                        var delta = popoverContent.height() - contentHeight;
                        popoverContent.height(contentHeight);
                        if (popover.hasClass("top"))
                            popover.css("top", parseInt(popover.css("top"), 10) + delta);
                        angular.element(".chg-risk-wrapper").focus();
                    } else {
                        var padding = 10;
                        var modal = _$j("#chg_risk_details .modal-body");
                        modal.css("padding", "0");
                        modal.height(contentHeight - padding);
                        modal.find(":first-child").css({
                            top: "0",
                            bottom: "0",
                            right: "0",
                            left: "0"
                        });
                        angular.element("#chk_risk_closemodal").focus();
                    }
                }

                function isValidParentWindow() {
                    return $window && $window.parent;
                }

                function hasRun(field) {
                    if ($scope.data[field + "_has_run"] && $scope.data[field + "_has_run"].value)
                        return $scope.data[field + "_has_run"].value;
                    return false;
                }

                function isShowRiskType(type, field) {
                    if ($scope.showViewDetails[type] === "always")
                        return true;
                    if ($scope.showViewDetails[type] === "match") {
                        if (field === CHANGE_RISK_DETAILS.EVALUATORS.RISK_CONDITION)
                            return isValidField(CHANGE_RISK_DETAILS.EVALUATORS.RISK_CONDITION, "risk_condition_risk");
                        else if (field === CHANGE_RISK_DETAILS.EVALUATORS.RISK_SCORE)
                            return isValidField(CHANGE_RISK_DETAILS.EVALUATORS.RISK_SCORE, "calculated_risk_score_risk");
                        return isValidField(field, field);
                    }
                    if ($scope.showViewDetails[type] === "never")
                        return false;
                }

                function isValidField(fieldName, riskName) {
                    if (!fieldName)
                        return false;
                    riskName = riskName || fieldName;
                    var hasRun = $scope.data[fieldName + "_has_run"] && $scope.data[fieldName + "_has_run"].value;
                    var hasValue = $scope.data[riskName] && $scope.data[riskName].value && !isNaN($scope.data[riskName].value);
                    return hasRun && hasValue;
                }

                function isPluginInstalled(name) {
                    return ($scope.pluginsInstalled && $scope.pluginsInstalled[name] === true);
                }

                angular.element($window.document).on("keydown", function(event) {
                    event = snRiskDetailsService.normalizeKeyCode(event);
                    if (RISK_ASSESSMENT_DETAILS.KEYS.ESCAPE === event.charCode && isValidParentWindow()) {
                        var target;
                        if ($scope.mode === "modal" && $window.parent.GlideModal) {
                            setTimeout(function() {
                                new $window.parent.GlideModal().get(RISK_ASSESSMENT_DETAILS.FORM.MODAL).destroy();
                            }, 0);
                            target = $window.parent.$j("#chg_risk_details_link");
                        } else if ($scope.mode === "popover" && isValidParentWindow() && $window.parent.nowapi) {
                            $window.parent.nowapi.g_popup_manager.exitPopup();
                            target = $window.parent.$j("#chg_risk_details_button");
                        }
                        $timeout(function() {
                            target.focus();
                        });
                    }
                });
                $scope.messages = {
                    "No matching risk conditions": i18n.getMessage("No matching risk conditions"),
                    "No risk condition matches the current record": i18n.getMessage("No risk condition matches the current record"),
                    "No match / incomplete": i18n.getMessage("No match / incomplete"),
                    "Unable to predict": i18n.getMessage("Unable to predict"),
                    "Disabled": i18n.getMessage("Disabled"),
                    "Not Set": i18n.getMessage("Not Set"),
                    "Selected risk type {0}": i18n.getMessage("Selected risk type {0}"),
                    "Calculated risk score failed": i18n.getMessage("Calculated risk score failed"),
                    "No probability condition matches the current record": i18n.getMessage("No probability condition matches the current record"),
                    "Calculated": i18n.getMessage("Calculated (Impact + Success Probability)"),
                    "Change Success Score": i18n.getMessage("Calculated (Impact + Change Success Score)"),
                    "Change Model Success": i18n.getMessage("Calculated (Impact + Change Model Success)")
                };
            },
        };
    })
    .directive("trapTabFocus", ["RISK_ASSESSMENT_DETAILS", "snRiskDetailsService", function(RISK_ASSESSMENT_DETAILS, snRiskDetailsService) {
        return {
            restrict: "A",
            link: function($scope, $element, $attr) {
                $element.on("keydown", function(event) {
                    var keyCode = snRiskDetailsService.normalizeKeyCode(event);
                    if (keyCode.keyCode === RISK_ASSESSMENT_DETAILS.KEYS.TABKEY) {
                        var firstEl;
                        var lastEl;
                        if ($scope.mode === "modal") {
                            var tabEls = snRiskDetailsService.getTabbableElements($element);
                            firstEl = tabEls.first();
                            lastEl = tabEls.last();
                        } else {
                            // Make the dialog the first and last elements since there are no other focusable elements
                            firstEl = angular.element(this);
                            lastEl = angular.element(this);
                        }
                        // tab and last element then focus on first element
                        if (!event.shiftKey && event.target === lastEl[0]) {
                            event.preventDefault();
                            firstEl.focus();
                        }
                        // shift+tab and first element then focus on last element
                        if (event.shiftKey && event.target === firstEl[0]) {
                            event.preventDefault();
                            lastEl.focus();
                        }
                    }
                });
            }
        };
    }]);
