function ($scope, $element, $window, $location, $rootScope, $timeout, snAttachmentHandler, $http, spUtil, userPreferences, $filter, i18n, $uibModal, spAriaUtil, $sce) {
  // Many of these fields are more configuration-type fields than profile fields. We still want to display
  // these to a user who is configuring their 'settings', but we shouldn't show them on a user profile page.
  // We need to handle this better.
  var fieldExcludes = {
    sys_user: ['name', 'introduction', 'title', 'department', 'location', 'photo',
                'manager', 'company']
  }

  $scope.$watch('data.dateTimeFormat', function() {
    if ($scope.data.dateTimeFormat != g_user_date_time_format)
      $scope.data.dateTimeFormatChanged = true;
  });


  $scope.connectEnabled = function() {
    return $scope.data.connectEnabled && !$scope.data.isLoggedInUsersProfile;
  }


  $scope.getSysUserModelFields = function() {
    if ($scope.data.userExists) {
      return $scope.data.sysUserModelList
              .filter(function(field) {
                return $scope.displayField("sys_user", field.name);
              });
    }
    return [];
  }

  $scope.getLangCode = function(lang) {
    return spUtil.localeMap[lang] || lang;
  }

  $scope.data.showAnalytics = $scope.data.analytics_enabled && $scope.data.sp_analytics_plugin_active && !NOW.user_impersonating && NOW.sp_analytics_portal_override != true && NOW.analytics_enabled && !NOW.isForceRestrictedPortal;
  $scope.data.userPreferencesChanged = false;
  $scope.data.dateTimeFormatChanged = false;
  // If the value exists in User Preference, then perform a comparision and show the update message
  $scope.data.analyticsPreferenceUpgraded = $scope.data.userPreferences.analytics.value !== null && $scope.data.userPreferences.analytics.value !== $scope.data.userAnalyticsDetails.tracking_enabled;
  $scope.data.showPrivacyPolicyLink = NOW.analytics_enabled && $scope.data.sp_analytics_plugin_active && $scope.data.userAnalyticsDetails.usage_tracking_allowed_for_session && !NOW.isForceRestrictedPortal;
  $scope.privacyPolicyLink =  $sce.trustAsUrl($scope.data.privacyPolicyLink);

  // get the list of values for a property using the concourse picker api (timezone, language)
  var getListValuesForProperty = function(endpoint, listProperty) {
    $http.get('/api/now/ui/concoursepicker/' + endpoint).then(function(response) {
      if (response && response.data && response.data.result && response.data.result.list) {
        if (!listProperty.list)
          listProperty.list = [];

        listProperty.list = response.data.result.list;
        if (response.data.result.current) {
          if (!listProperty.current)
            listProperty.current = {};
          listProperty.current = $filter('filter')(listProperty.list, {value: response.data.result.current}, true)[0];
        }
      }
    });
  };

  // list of user properties that are not user preferences
  $scope.data.listProperties = {
    timezone: {},
    encryption: {},
    language: {}
  }

  // initialize dropbox data
  getListValuesForProperty('timezone', $scope.data.listProperties.timezone);
  getListValuesForProperty('language', $scope.data.listProperties.language);
  getListValuesForProperty('encryption', $scope.data.listProperties.encryption);

  //set the user property
  $scope.setPreferenceValue = function(endpoint, value) {
    $http.put('/api/now/ui/concoursepicker/' + endpoint, {current : value, id: value}).then(function(response) {
      if (response && response.data && response.data.result) {
        $scope.data.userPreferencesChanged = true;
      }
    });
  }

  $rootScope.$on('$locationChangeStart', function(event, newUrl) {
	if ($scope.data.userPreferencesChanged) {
	    event.preventDefault();
	    $window.location.href = newUrl;
	}
  });

  //set the user preference value
  $scope.setUserPreferenceValue = function(userProperty) {
    userPreferences.setPreference(userProperty.key, userProperty.value).then(function() {
          $scope.data.userPreferencesChanged = true;
    });
  };

  $rootScope.$on('userPreferencesChanged', function() {
    $scope.data.userPreferencesChanged = true;
  });

  if ($scope.data.preferredChannelsList) {
      $scope.selectedValues = [];
      for (var i = 0; i < $scope.data.preferredChannelsList.length; i++) {
          var value = $scope.data.preferredChannelsList[i];
          for (var j = 0; j < $scope.data.channelList.length; j++) {
              if ($scope.data.channelList[j].value === value) {
                  $scope.selectedValues.push(value);
                  break;
              }
          }
      }
  }

  $scope.onChangeChannel = function(selectedValues) {
      var selectedLabels = [];
      for (var i = 0; i < selectedValues.length; i++) {
          var value = selectedValues[i];
          for (var j = 0; j < $scope.data.channelList.length; j++) {
              if ($scope.data.channelList[j].value === value) {
                  selectedLabels.push($scope.data.channelList[j].display);
                  break;
              }
          }
      }

      $scope.setUserPreferenceValue({
          "key": "sp_preferred_communication_channels",
          "value": selectedValues.join(',')
      });
      $scope.selectedValues = selectedLabels;
  };

  $timeout(function() {
      $('#communication_picker_select').select2({
          placeholder: "Select communication channels",
          allowClear: true,
          width: "100%",
          formatSelectionCssClass: select2Helpers.formatSelectionCssClass,
      });
  }, 0);

  var select2Helpers = {
      formatSelectionCssClass: function(item, el) {
          var anchorEl = el.parent().find("a");
          anchorEl.removeAttr("tabindex");
          anchorEl.addClass("fa fa-times");
          var title = i18n.getMessage("Remove {0} from Preferred Communication Channels").withValues([item.text]);
          anchorEl.attr({
              "data-toggle": "tooltip",
              "data-container": "body",
              "title": title
          });

          var hideTooltipTimeout;
          anchorEl.on("click", function() {
              clearTimeout(hideTooltipTimeout);
              hideTooltipTimeout = setTimeout(function() {
                  $('.tooltip').tooltip("hide");
              }, 300);
          });
      }
  }

  $scope.updateUserTracking = function(trackingEnabled) {
    var params = { "user_consent": trackingEnabled ? 'Y' : 'N' };
    $http.post("/api/now/sp/consent/update", params).then(function (response) {
      var updatedConsent = JSON.parse(response.data.result);
      updateTrackingDetails(updatedConsent);
      $scope.data.userPreferencesChanged = true;
    });
  };

  var updateTrackingDetails = function(userConsent) {
    NOW.usage_tracking.usage_tracking_allowed_for_session = userConsent.usage_tracking_allowed_for_session;
    NOW.usage_tracking.user_consent = userConsent.user_consent;
    NOW.usage_tracking.tracking_enabled = userConsent.tracking_enabled;
    NOW.usage_tracking.consent_toggle_available = userConsent.consent_toggle_available;
  };

  $scope.getAnalyticsUpgradeMessage = function() {
	  return i18n.getMessage('Your analytics preference has been updated and synced across interfaces.');
  };

  $scope.toggle = function(e, userProperty) {
    if (e.type === 'keypress' && e.keyCode === 32) {
      userProperty.value = !userProperty.value;
      $scope.setUserPreferenceValue(userProperty);
    }
  }

  $scope.reloadPage = function() {
      $window.location.reload(true);
  };

  $scope.displayField = function(tableName, field, isHeader) {
    if (!isHeader && fieldExcludes[tableName].indexOf(field) > -1) return false;

    if (models[tableName][field] && models[tableName][field].type === "boolean") return false;

    if ($scope.data.isLoggedInUsersProfile) {
      if (models[tableName][field] && models[tableName][field].readonly)
        return models[tableName][field].displayValue;
      else
        return models[tableName][field];
    } else {
      return models[tableName][field] && models[tableName][field].displayValue;
    }
  }

  $scope.triggerMFAConfigurationModal = function() {
    $window.location = "?id=multi_factor_authentication";
  }

  $scope.triggerEnrollSoftPinModal = function() {
    $window.location = "?id=enroll_soft_pin";
  }

  $scope.triggerManageCertificatesModal = function() {
    $window.location = '?id=client_certificate_list&table=sys_user_certificate&filter=user=' + $scope.data.sysUserID;
  }

  $scope.triggerRegisterTrustedDevice = function() {
		$window.location = '?id=register_trusted_device';
	}
  $scope.openIdentityCenter = function() {
		$window.location = '/now/identity-center/home/' + encodeURIComponent($window.location.pathname + $window.location.search + $window.location.hash);
	}
  $scope.commenceContinuousAuthentication = function(caCorrelationId) {
		$window.open('/api/now/continuous_authentication/high_assurance/create?correlationId=' + caCorrelationId, '_blank');
	}

  $scope.triggerCertificateConfigurationModal = function() {
        $scope.data.action = 'certRegister';
        $scope.server.update().then(function(response) {
            if (response.certHeader == 'false')
                spUtil.addErrorMessage($scope.data.certErrorMsg);
            else {
                var pageRoot = angular.element('.sp-page-root');
                $scope.certAuthModalModalInstance = $uibModal.open({
                    templateUrl: 'certAuthModalTemplate',
                    scope: $scope,
                    size: 'lg'
                });
                $scope.certAuthModalModalInstance.rendered.then(function() {
                    var h1 = angular.element('#certAuthModal');
                    var modal = h1.closest('div.modal');
                    modal.attr('aria-labelledby', 'certAuthModal');
                    pageRoot.attr('aria-hidden', 'true');
                });
                $scope.certAuthModalModalInstance.closed.then(function() {
                    pageRoot.attr('aria-hidden', 'false');
                });
            }
        });
        createCloseCertAuthModalHandler();
        }

  $scope.dismissCertAuthConfigurationModal = function() {
        $scope.certAuthModalModalInstance.close();
    }

  $scope.sysUserModelFields = $scope.getSysUserModelFields();

  function createCloseCertAuthModalHandler() {
        // This is a hack. Wait for the inner iframe to load, then mock
        // the GlideDialogWindow close function to do the right thing. If it's not ready
        // after a second, try again 9 more times. 
        var retryCount = 0;
        var maxRetries = 10;
        tryOverrideGlideDialogWindowClose();

        function tryOverrideGlideDialogWindowClose() {
            $timeout(function() {
                var frameGlideDialogWindow = document.getElementById('cert-auth-config-window').contentWindow['GlideDialogWindow'];
                if (!frameGlideDialogWindow) {
                    retryCount++;
                    if (retryCount >= maxRetries)
                        return;

                    tryOverrideGlideDialogWindowClose();
                    return;
                }

                frameGlideDialogWindow.get = function() {
                    return {
                        destroy: function() {
                            $scope.dismissCertAuthConfigurationModal();
                        }
                    }
                };
            }, 1000);
        }
    }
}
