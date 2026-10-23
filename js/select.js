// Свои выпадающие списки в стиле приложения (системный список выглядит чужим).
// Настоящий <select> остаётся в странице скрытым: остальной код работает с ним как раньше.
(function () {
    function enhance(select) {
        if (select.dataset.enhanced) return;
        select.dataset.enhanced = '1';
        var wrap = document.createElement('div');
        wrap.className = 'dd';
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'dd-btn';
        btn.setAttribute('aria-haspopup', 'listbox');
        var label = document.createElement('span');
        label.className = 'dd-label';
        btn.appendChild(label);
        btn.insertAdjacentHTML('beforeend', '<svg class="dd-caret" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>');
        var menu = document.createElement('ul');
        menu.className = 'dd-menu';
        menu.setAttribute('role', 'listbox');
        menu.hidden = true;
        select.parentNode.insertBefore(wrap, select);
        wrap.appendChild(btn);
        wrap.appendChild(menu);
        wrap.appendChild(select);
        select.classList.add('dd-native');
        select.tabIndex = -1;

        function sync() {
            var o = select.options[select.selectedIndex];
            var text = o ? o.textContent : '';
            if (label.textContent !== text) label.textContent = text;
            btn.classList.toggle('is-placeholder', !!(o && o.disabled));
        }
        function close() { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); }
        function open() {
            menu.innerHTML = '';
            Array.prototype.forEach.call(select.options, function (o, i) {
                var li = document.createElement('li');
                li.setAttribute('role', 'option');
                li.textContent = o.textContent;
                if (o.disabled) li.className = 'is-disabled';
                else {
                    if (i === select.selectedIndex) li.className = 'is-selected';
                    li.addEventListener('click', function () {
                        select.selectedIndex = i;
                        select.dispatchEvent(new Event('change', { bubbles: true }));
                        sync(); close();
                    });
                }
                menu.appendChild(li);
            });
            menu.hidden = false;
            btn.setAttribute('aria-expanded', 'true');
        }
        btn.addEventListener('click', function (e) { e.stopPropagation(); if (menu.hidden) open(); else close(); });
        document.addEventListener('click', function (e) { if (!wrap.contains(e.target)) close(); });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
        select.addEventListener('change', sync);
        setInterval(sync, 400);
        sync();
    }
    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('select#preset-select, select.neon-select').forEach(enhance);
    });
})();
