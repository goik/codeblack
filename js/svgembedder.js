if (document.addEventListener) {
	document.addEventListener('DOMContentLoaded', function () {
		var base,
			cache = {},
			hash,
			i,
			onload,
			url,
			uses = document.getElementsByTagName('use'),
			xhr;
		onload = function () {
			var body = document.body,
				x = document.createElement('x');
			x.innerHTML = xhr.responseText;
			body.insertBefore(x.firstChild, body.firstChild);
		};
		for (i = 0; i < uses.length; i += 1) {
			url = uses[i].getAttribute('xlink:href').split('#');
			base = url[0];
			hash = url[1];
			if (!base.length && hash && !document.getElementById(hash)) {
				base = 'http://i.icomoon.io/public/temp/3860a9a8f4/UntitledProject/svgdefs.svg';
			}
			if (base.length) {
				cache[base] = cache[base] || (window.XDomainRequest ? new XDomainRequest() : new XMLHttpRequest());
				xhr = cache[base];
				if (!xhr.onload) {
					xhr.onload = onload;
					xhr.open('GET', base);
					xhr.send();
				}
			}
		}
	}, false);
}
