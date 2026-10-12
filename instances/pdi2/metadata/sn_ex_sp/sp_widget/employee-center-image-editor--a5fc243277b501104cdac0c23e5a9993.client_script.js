api.controller = function($timeout, $scope, $element, spAriaUtil, i18n, $uibModal, $rootScope, $uibModalStack) {
	var c = this;
	c.newUpload = false;
	c.customizeCropper = false;

	$('.modal-footer,.modal-header').hide();
	$('.modal-body').css('padding', '0');

	$timeout(function() {
		$('.ec-modal-close-btn').focus();
	});

	c.uploadNewImage = function($event) {
		$event.stopPropagation();
		$event.preventDefault();
		var $el = $element.find('[id=upload-image]');
		$el.click();
	};

	c.closeModal = function() {
		$uibModalStack.dismissAll();
	};

	c.removeImage = function($event) {
		$scope.modalInstance = $uibModal.open({
			templateUrl: 'removeImage',
			scope: $scope,
			backdrop: "static",
			size: "xs",
			controller: function($scope, $uibModalInstance) {
				$scope.deleteBanner = function() {
					$uibModalInstance.close();
					$rootScope.$broadcast(c.data.broadcastId, null);
					$uibModalStack.dismissAll();
				};
				$scope.dismissModal = function() {
					$uibModalInstance.close();
				};
			}
		}).rendered.then(function () {
			$uibModalStack.getTop().value.modalDomEl.attr('id', 'internal');
		});
	};

	c.keyDownEvent = function($event) {
		var tabbableElements = $('.ec-modal-container').find('button');
		var focusChanged = false;
		if($event.which == 9) {
			if($event.shiftKey) {
				if (c.isFocusInFirstItem($event, tabbableElements)){
					focusChanged = c.focusLastFocusableElement(tabbableElements);
				}
			}
			else {
				if (c.isFocusInLastItem($event, tabbableElements)) {
					focusChanged = c.focusFirstFocusableElement(tabbableElements);
				}
			}
			if (focusChanged) {
				$event.preventDefault();
			}
		}
	};

	c.isFocusInFirstItem = function(event, list) {
		if (list.length > 0) {
			return (event.target || event.srcElement) === list[0];
		}
		return false;
	};

	c.isFocusInLastItem = function(event, list) {
		if (list.length > 0) {
			if((event.target || event.srcElement) === list[list.length - 1]) 
				return true;
			else if( (list[list.length - 1].disabled === true) && 
							((event.target || event.srcElement) === list[list.length - 2]) ) {
				return true;
			}
		}
		return false;
	};

	c.focusLastFocusableElement = function(list) {
		if (list.length > 0) {
			if(list[list.length - 1].disabled === true) {
				list[list.length - 2].focus();
			} else {
				list[list.length - 1].focus();
			}
			return true;
		}
		return false;
	};

	c.focusFirstFocusableElement = function(list) {
		if (list.length > 0) {
			list[0].focus();
			return true;
		}
		return false;
	};

	c.uploadImage = function($event) {
		var canvas = c.cropper.getCroppedCanvas();
		if (canvas.toBlob) {
			canvas.toBlob(function (blob) {
				blob.lastModifiedDate = new Date();
              			blob.name = "newImage.png";
				$rootScope.$broadcast(c.data.broadcastId, blob);
				$uibModalStack.dismissAll();
			}, 'image/png');
		} 
		else {
			var binStr = atob(canvas.toDataURL('image/png', 1).split(',')[1]);
			var len = binStr.length;
			var arr = new Uint8Array(len);
			for (var i = 0; i < len; i++)
				arr[i] = binStr.charCodeAt(i);

			var blob = new Blob([arr], { type:'image/png' });
			blob.lastModifiedDate = new Date();
          		blob.name = "newImage.png";
			$rootScope.$broadcast(c.data.broadcastId, blob);
			$uibModalStack.dismissAll();
		}
	};


	c.attachFiles = function(files) {
		if (!files.files.length) 
			return;

		var file = files.files[0];
		var reader = new FileReader();
		var preview = document.querySelector('.bg-img');
		
		var fileTypes = ["image/jpeg", "image/png", "image/bmp", "image/x-windows-bmp", "image/svg+xml"];

		if (file && file.type) {
			if (fileTypes.indexOf(file.type) > -1) {
				reader.readAsDataURL(file);
			} else {
				alert(file.name + " " + i18n.getMessage("isn't a recognized image file format"));
				return;
			}
		}
		
		reader.addEventListener("load", function() {
			c.setupCropper('new', reader.result);
		}, false);
		
		c.data.isImagePresent = true;
		c.newUpload = true;
		c.data.disableApplyButton = false;
		setTabIndexForApplyButton('0');
	};
	
	if(c.data.isImagePresent) {
		c.data.disableApplyButton = true;
		setTabIndexForApplyButton('-1');
		$timeout(function() {
			c.setupCropper('edit', c.data.imgSrc);
		});
	}

	c.action = function (event) {
		var cropped;
		var data;
		var e = event || window.event;
		var target = e.target || e.srcElement;

		if (!c.cropper) {
			return;
		}

		data = {
			method: target.getAttribute('data-method'),
			option: target.getAttribute('data-option') || undefined,
			secondOption: target.getAttribute('data-second-option') || undefined
		};

		cropped = c.cropper.cropped;

		if (data.method) {
			if(data.method === 'rotate') {
				if (cropped) {
					c.cropper.clear();
				}
			}
			//Action
			c.cropper[data.method](data.option, data.secondOption);
			c.data.disableApplyButton = (data.method == 'reset' && !c.newUpload) ? true : false;
			if(c.data.disableApplyButton) 
				setTabIndexForApplyButton('-1');
			else
				setTabIndexForApplyButton('0');

			switch (data.method) {
				case 'rotate':
					if (cropped)
						c.cropper.crop();
					break;
				case 'scaleX':
				case 'scaleY':
					target.setAttribute('data-option', -data.option);
					break;
			}

			if((data.method == 'reset' || data.method == 'rotate') &&
				 !c.data.isCircularCrop && c.customizeCropper) {
				$('.cropper-crop-box').css('transform', 'translateY(0)');
			}
		}
	};
	
	c.setupCropper = function(mode, imgSrc) {
		var image = document.getElementById('image');
		image.src = imgSrc;
		
		var aspectRatio =  c.data.aspectRatio;
		var dragMode = c.data.dragMode;
		var cropBoxMovable = c.data.moveCropBox;
		var cropBoxResizable = c.data.resizeCropBox;
		var viewMode = c.data.viewMode;
		var autoCropArea = c.data.autoCropArea;
		
		c.height = ($('.bg-img-container')[0].offsetWidth)/4;
		if (c.height >= 100) $('.bg-img-container').css('height', c.height);
		
		if(c.height < 100) {
			c.customizeCropper = true;
		}
		
		var options = {
			autoCropArea : autoCropArea,
			aspectRatio: aspectRatio,
			dragMode: dragMode,
			viewMode: viewMode,
			cropBoxMovable: cropBoxMovable,
			cropBoxResizable: cropBoxResizable,
			cropstart: function(event) {
				c.data.disableApplyButton = false ;
				setTabIndexForApplyButton('0');
			},
			ready: function () {
				if(!c.data.isCircularCrop) {
					$('.cropper-view-box, .cropper-face').css('border-radius', '0%');
					$('.cropper-crop-box').css('max-width', '100%');
					if(c.customizeCropper){
						$('.cropper-container').css('height', c.height);
						$('.cropper-crop-box').css('transform', 'translateY(0)');
					}
				}
			}
		};
		
		if (c.cropper && mode === 'new')
			c.cropper.destroy();
		c.cropper = new Cropper(image, options);
	};
	
	function setTabIndexForApplyButton(value) {
		$('.btn-apply').attr('tabindex',value);
	}
};
