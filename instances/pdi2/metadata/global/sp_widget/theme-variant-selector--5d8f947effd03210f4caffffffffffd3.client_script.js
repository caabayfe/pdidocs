api.controller=function($scope, $rootScope, $timeout) {
    var c = this;

    $scope.applyVariantCss = function(variantMappingId, variantMappingStyle) {
        if (!variantMappingStyle) return;

        var variantDynamicCSS = [];

        if (hasValidColorKeys(variantMappingStyle, ['$background-secondary', '$border-primary'])) {
            variantDynamicCSS.push(`.theme-diagram {
    background-color: ` + variantMappingStyle['$background-secondary'] + `;
    outline: thin solid ` + variantMappingStyle['$border-primary'] + `;
}`);
        }

        if (hasValidColorKeys(variantMappingStyle, ['$brand-primary'])) {
            variantDynamicCSS.push(`.theme-primary {
    background-color: ` + variantMappingStyle['$brand-primary'] + `;
}`);
        }

        if (hasValidColorKeys(variantMappingStyle, ['$brand-primary-darker'])) {
            variantDynamicCSS.push(`.theme-navbar {
    background-color: ` + variantMappingStyle['$brand-primary-darker'] + `;
}`);
        }

        if (hasValidColorKeys(variantMappingStyle, ['$body-bg'])) {
            variantDynamicCSS.push(`.theme-user {
    background-color: ` + variantMappingStyle['$body-bg'] + `;
}`);
        }

        if (hasValidColorKeys(variantMappingStyle, ['$background-primary', '$border-tertiary'])) {
            variantDynamicCSS.push(`.theme-main-body div {
    background-color: ` + variantMappingStyle['$background-primary'] + `;
    border: thin solid ` + variantMappingStyle['$border-tertiary'] + `;
}`);
        }

        if (hasValidColorKeys(variantMappingStyle, ['$text-tertiary'])) {
            variantDynamicCSS.push(`.theme-main-body div hr {
    border-color: ` + variantMappingStyle['$text-tertiary'] + `;
}`);
        }

        if (variantDynamicCSS.length > 0) {
            if (!variantMappingId || variantMappingId == '')
                variantMappingId = 'default';
            var variantClass = 'sp-theme-variant-mapping-' + variantMappingId;
            var cssRule = '.' + variantClass + ' { \n' + variantDynamicCSS.join('\n') + '\n}';
            var style = document.createElement('style');
            style.textContent = cssRule;
            document.head.appendChild(style);
        }
    };

    $scope.setUserThemeVariant = function(variantMappingId) {
        var url = new URL(location.href);
        c.server.get({action: "changeVariant", variantId: variantMappingId, clearProperty: !variantMappingId}).then(function(resp){
            if(resp.data.success){
                if (c.options.display === 'dropdown')
                    location.replace(url.href);

                $rootScope.$emit('userPreferencesChanged');
            }
        });
    };

    $scope.handleVariantKeypress = function(event, variant) {
        if (event.key === "Enter" || event.key === " ") {
			if (variant.sys_id === $scope.data.themeVariantMappingId) return;
            var variantOption = event.target.querySelector('input[type="radio"]');
			$scope.data.themeVariantMappingId = variant.sys_id;
            variantOption.checked = true;

            $scope.setUserThemeVariant(variant.sys_id);
            event.preventDefault();
        }
    };

    function addTooltips() {
        var elements = $('.theme-option-label');
        angular.forEach(elements, function(el) {
            var parentOption = el.closest('.theme-option');
            var tooltipTarget = parentOption || el;
            if (tooltipTarget.hasAttribute('title')) return;

            var variantName = $(el).children('span')[0];
            var tooltipText = null;
            if (variantName && variantName.scrollWidth > variantName.clientWidth) {
                tooltipText = el.textContent.trim();
            }

            var variantClassRegex = /sp-theme-variant-mapping-([a-z0-9]+)/;
            var match = tooltipTarget.className.match(variantClassRegex);
            if (match) {
                var variantDescription = c.data.themeVariantMappings.find(variant => (variant.sys_id === match[1] || 'default' === match[1])).description;
                if (variantDescription)
                    tooltipText = tooltipText ? tooltipText + " - " + variantDescription : variantDescription;
            }
            if (tooltipText) {
                tooltipTarget.setAttribute('title', tooltipText);
            }
        });
    }

    function hasValidColorKeys(obj, keys) {
        return keys.every(function(key) {
            var value = obj && obj[key] ? obj[key] : null;
            return value && CSS.supports('color', value);
        });
    }

	$timeout(addTooltips);
};
