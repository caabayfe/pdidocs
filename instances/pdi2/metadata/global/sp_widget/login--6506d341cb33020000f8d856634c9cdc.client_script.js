function loginCtrl($scope, $http, $window, $location, glideUserSession, glideSystemProperties, spUtil) {

	var c = this;
	c.remember_me = c.data.forgetMe ? false : c.data.rememberMeDefault;
	c.data.url_suffix = $scope.portal ? $scope.portal.url_suffix : "";
	c.masked = true;
	if (!c.data.is_logged_in && c.data.multisso_enabled && c.data.default_idp) {
		var pageId = $location.search().id || $scope.page.id;
		var isLoginPage = ($scope.portal.login_page_dv == pageId) || ('login' == pageId);
		c.server.get({
			action: "set_sso_destination",
			pageURI: isLoginPage ? null : $location.url()
		}).then(function() {
			$window.location = "/login_with_sso.do?glide_sso_id=" + c.data.default_idp;
		});
	} else if (!c.data.is_logged_in && c.data.certAuthRedirect && c.data.cert_based_auth && c.data.certHeader == "true") {
        login(null, null, true);
    }
    
    c.login = function(username, password, isCertLogin) {
        login(username, password, isCertLogin);
    };
	
	function login(username, password, isCertLogin) {
		var url = spUtil.getURL({sysparm_type: 'view_form.login'});
		
		// If the page isn't public, then the ID in the
		// URL won't match the rendered page ID
		var pageId = $location.search().id || $scope.page.id;
		var isLoginPage = ($scope.portal.login_page_dv == pageId) || ('login' == pageId);

		return $http({
			method: 'post',
			url: url,
			data: $.param({
				'sysparm_type': 'login',
				'ni.nolog.user_password': true,
				'remember_me': !!c.remember_me ? true : false,
				'user_name': username,
				'user_password': password,
				'get_redirect_url': true,
				'is_direct_redirect': true,
				'sysparm_goto_url': isLoginPage ? null : $location.url(),
				'mfa_redirect_url': isLoginPage ? null : c.data.pageURI,
				'cert_login' : !!isCertLogin
			}),
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		}).then(function(response) {
			if (!response.data) {
				c.message = $scope.data.errorMsg;
				return;
			}

			if (response.data.status == 'success') {
				if (c.data.multiFactorAuthEnabled) {
					if(response.data.session_token)
						window.g_ck = response.data.session_token;
					c.server.get({
						action: "multi_factor_auth_setup",
						directTo: response.data.redirect_url
					}).then(handleLoginResponse.bind(response), handleLoginResponse.bind(response));
				} else {
					handleLoginResponse.call(response);
				}
			} else if (response.data.status == 'mfa_code_required') {
					$window.location = '/validate_multifactor_auth_code.do';
			} else {
				// wrong username or password
				c.message = response.data.message;
				c.password = "";
				c.username = "";
				angular.element("#username").focus();
			}

		}, function errorCallback(response) {
			c.message = $scope.data.errorMsg;
		});
	};

	c.oidcLogin = function(idProvider){
		var pageId = $location.search().id || $scope.page.id;
		var isLoginPage = $scope.portal.login_page_dv == pageId;
		c.server.get({
			action: "set_sso_destination",
			pageURI: isLoginPage ? null : $location.url()
		}).then(function() {
			$window.location = "/login_with_sso.do?glide_sso_id=" + idProvider;
		});
	};
	
	c.externalLogin = function() {
		var pageId = $location.search().id || $scope.page.id;
		var isLoginPage = ($scope.portal.login_page_dv == pageId) || ('login' == pageId);
		c.server.get({
			action: "set_sso_destination",
			pageURI: isLoginPage ? null : $location.url()
		}).then(function() {
			glideSystemProperties.set("glide.authenticate.multisso.enabled", true);

			glideUserSession.getSsoRedirectUrlForUsername(c.username)
				.then(function(url) {
					$window.location = url;
				}, function(err) {
					spUtil.addErrorMessage($scope.data.errorMsg2);
				});
		});
	}

	function handleLoginResponse() {
		c.success = this.data.message;
		$window.location = this.data.redirect_url;
		if ($window.location.hash.length > 0)
			$window.location.reload();
	}

	c.setExternalLogin = function(newVal) {
		c.externalLoginMode = newVal;
		if(!newVal)
			c.masked = true;
	}
	
	c.renderMaskIcon = function() {
		var passwordEle = document.getElementById("password");
		var maskEle = document.getElementById("mask_icon");
		$(maskEle).tooltip('hide');
		var btnDescription = document.getElementById("btnDescription");
		var element = document.getElementsByClassName("mask_btn")[0];
		var isPasswordType = passwordEle.type === 'password';
		maskEle.classList.toggle('active', isPasswordType);
    		maskEle.setAttribute('data-original-title', (isPasswordType) ? '${Hide password}' : '${Show password}');
    		element.setAttribute('aria-label', (isPasswordType) ? '${Hide password}' : '${Show password}');		
		passwordEle.type  = (isPasswordType) ? 'text' : 'password';
		btnDescription.textContent = (isPasswordType)? '${Password shown}' : '${Password hidden}';
	}
}
