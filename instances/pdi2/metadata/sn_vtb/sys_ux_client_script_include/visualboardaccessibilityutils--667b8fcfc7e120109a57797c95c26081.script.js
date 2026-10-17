function include({imports}) {
	const querySelectorDeep = (selector, rootEl) => {
		if (rootEl.matches && rootEl.matches(selector)) return rootEl;
		const children = rootEl.children;
		for (let i = 0; i < children.length; i++) {
			if (children[i].matches && children[i].matches(selector))
				return children[i];
			const child = querySelectorDeep(selector, children[i]);
			if (child) return child;
		}
		if (rootEl.shadowRoot)
			return querySelectorDeep(selector, rootEl.shadowRoot);
		return null;
	};
	const closestDeep = (el, selector) => {
		if (!el) return null;
		if (el.matches(selector)) return el;
		if (el.parentElement !== null)
			return closestDeep(el.parentElement, selector);
		// escape the shadow root
		if (el.getRootNode() !== null)
			return closestDeep(el.getRootNode().host, selector);
	};
	const focusInside = (el, selector, event) => {
		const internalElem = querySelectorDeep(selector, el);
		if (internalElem) {
			event.preventDefault();
			internalElem.focus();
		}
	};
	const focusOutside = (el, selector, event) => {
		const parentElement = closestDeep(el, selector);
		if (parentElement) {
			event.preventDefault();
			parentElement.focus();
		}
	};
	return {
		querySelectorDeep,
		closestDeep,
		focusInside,
		focusOutside
	};
}
