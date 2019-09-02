if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector ||
        Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
    Element.prototype.closest = function (s) {
        var el = this;

        do {
            if (el.matches(s)) return el;
            el = el.parentElement || el.parentNode;
        } while (el !== null && el.nodeType === 1);
        return null;
    };
}

var Radzen = {
    numericOnPaste: function (e) {
        if (e.clipboardData) {
          var value = e.clipboardData.getData('text');

          if (value && /^-?\d*\.?\d*$/.test(value)) {
            return;
          }

          e.preventDefault();
        }
    },
    numericKeyPress: function (e) {
        if (e.metaKey || e.ctrlKey || e.keyCode == 9 || e.keyCode == 8 || e.keyCode == 13) {
            return;
        }

        var ch = String.fromCharCode(e.charCode);

        if (/^[-\d,.]$/.test(ch)) {
            return;
        }

        e.preventDefault();
    },
    openPopup: function (e, el, popup, isDropDown, additionalStyle) {
        const handler = function () {
            popup.style.display = 'none';
            window.removeEventListener('wheel', handler);
        };
        window.addEventListener('wheel', handler);

        var style = isDropDown ? `margin-left:-0.625rem; z-index: 1005; transform: translateY(3px); opacity: 1; display:block; position: fixed; ${Radzen.getPopupWidthAndTop(popup).replace('display:none;', '')};${additionalStyle}`
            : `margin-left: 0px; z-index: 1002; transform: translateY(0px); opacity: 1; position: fixed; ${Radzen.getPopupWidthAndTop(popup).replace('display:none;', '')};${additionalStyle}`;

        popup.style.cssText = popup.style.display == 'none' ? style : 'display:none;';
    },
    closePopup: function (e, el, popup) {
        if (!el.contains(e.relatedTarget) && popup) {
            popup.style.display = 'none';
        }
    },
    getInputValue: function (arg) {
        var input = (arg instanceof Element || arg instanceof HTMLDocument) ? arg : document.getElementById(arg);
        return input ? input.value : '';
    },
    getPopupWidthAndTop: function (popup, sibling) {
        var el = sibling ? popup.previousElementSibling : popup.parentNode;
        var elHeight = sibling ? popup.getBoundingClientRect().height : 0;
        var rect = el.getBoundingClientRect();
        var display = popup.style.display == 'none' ? 'display:none;' : '';
        return `width:calc(${rect.width + 'px'} - 1.425rem); top:${rect.top + rect.height + elHeight - 3 + 'px'}; ${display}`;
    },
    readFileAsBase64: function (fileInput) {
        const readAsDataURL = function (fileInput) {
            return new Promise(function (resolve, reject) {
                const reader = new FileReader();
                reader.onerror = function () {
                    reader.abort();
                    reject(new Error("Error reading file."));
                };
                reader.addEventListener("load", function () {
                    resolve(reader.result);
                }, false);
                reader.readAsDataURL(fileInput.files[0]);
            });
        };

        return readAsDataURL(fileInput);
    },
    closeMenuItems: function (event) {
        var menu = event.target.closest('.menu');

        if (!menu) {
            var targets = document.querySelectorAll('.navigation-item-wrapper-active');

            if (targets) {
                for (var i = 0; i < targets.length; i++) {
                    Radzen.toggleMenuItem(targets[i], false);
                }
            }
            document.removeEventListener('click', Radzen.closeMenuItems);
        }
    },
    closeOtherMenuItems: function (current) {
        var targets = document.querySelectorAll('.navigation-item-wrapper-active');
        if (targets) {
            for (var i = 0; i < targets.length; i++) {
                var target = targets[i];
                var item = target.closest('.navigation-item');

                if (!item.contains(current)) {
                    Radzen.toggleMenuItem(target, false);
                }
            }
        }
    },
    toggleMenuItem: function (target, selected) {
        Radzen.closeOtherMenuItems(target);

        var item = target.closest(".navigation-item");

        if (selected === undefined) {
            selected = !item.classList.contains('navigation-item-active');
        }

        item.classList.toggle('navigation-item-active', selected);

        target.classList.toggle('navigation-item-wrapper-active', selected)

        var children = item.querySelector('.navigation-menu');

        if (children) {
            children.style.display = selected ? '' : 'none';
        }

        var icon = item.querySelector('.navigation-item-icon-children');

        if (icon) {
            var deg = selected ? '180deg' : 0;
            icon.style.transform = 'rotate(' + deg + ')';
        }

        document.removeEventListener('click', Radzen.closeMenuItems);
        document.addEventListener('click', Radzen.closeMenuItems);
    }
};