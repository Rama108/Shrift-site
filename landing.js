// Главная Shrift: вкладки по адресу (#home, #how, #pricing, #faq).
(function () {
    var views = ['home', 'how', 'pricing', 'faq'];
    function route() {
        var h = (location.hash || '#home').slice(1);
        if (views.indexOf(h) < 0) h = 'home';
        views.forEach(function (v) { document.getElementById('v-' + v).hidden = v !== h; });
        document.querySelectorAll('nav.tabs a').forEach(function (a) {
            if (a.getAttribute('href') === '#' + h) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
        });
        window.scrollTo(0, 0);
    }
    window.addEventListener('hashchange', route);
    route();
})();
