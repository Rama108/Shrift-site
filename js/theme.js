// Тема (тёмная/светлая) общая для сайта и приложения. Выбор хранится в браузере.
(function () {
    var root = document.documentElement;
    function read() { try { return localStorage.getItem('shrift-theme'); } catch (e) { return null; } }
    function write(v) { try { localStorage.setItem('shrift-theme', v); } catch (e) { /* без сохранения тоже работает */ } }
    function apply(t) {
        if (t === 'light') root.setAttribute('data-theme', 'light'); else root.removeAttribute('data-theme');
        var sun = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
        var moon = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/></svg>';
        document.querySelectorAll('[data-theme-toggle]').forEach(function (b) { b.innerHTML = t === 'light' ? moon : sun; });
    }
    apply(read() === 'light' ? 'light' : 'dark');   // по умолчанию тёмная
    document.addEventListener('DOMContentLoaded', function () {
        apply(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
        document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
            b.addEventListener('click', function () {
                var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
                write(next); apply(next);
            });
        });
    });
})();

// Закраска пройденной части ползунков (оранжевая полоса до бегунка).
(function () {
    function paint() {
        document.querySelectorAll('input[type="range"].neon-slider').forEach(function (r) {
            var min = parseFloat(r.min || 0), max = parseFloat(r.max || 100), v = parseFloat(r.value);
            r.style.setProperty('--p', (max > min ? (v - min) / (max - min) * 100 : 0) + '%');
        });
    }
    document.addEventListener('input', paint);
    document.addEventListener('DOMContentLoaded', function () { paint(); setInterval(paint, 500); });
})();
