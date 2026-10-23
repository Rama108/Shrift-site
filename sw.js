// Service Worker сайта Shrift (генерируется tools/build_site.py, не править dist/sw.js руками).
// - Оболочка сайта (html/js/css/шрифты/core.zip) кэшируется целиком при установке новой
//   версии; старые версии удаляются. Новая сборка = новый BUILD_ID = свежая оболочка.
// - Движок (pyodide_min/*) не меняется между сборками: кэш «сначала из кэша».
// - version.json всегда идёт в сеть: по нему сайт проверяет, что есть интернет.
const BUILD_ID = '00afe14ed4bd';
const APP_CACHE = 'shrift-app-' + BUILD_ID;
const ENGINE_CACHE = 'shrift-engine-4048081f241d';
const APP_FILES = ["./", "app.html", "css/styles.css", "favicon.svg", "fonts/LICENSE_math_symbols.txt", "fonts/Rama-Regular.ttf", "fonts/math_symbols.ttf", "img/ex-formulas.webp", "img/ex-handwriting.webp", "img/ex-lecture.webp", "img/ex-physics.webp", "index.html", "js/app.js", "js/select.js", "js/theme.js", "landing.css", "landing.js", "media/image_rId5.png", "presets.json", "pyodide_worker.js", "python_app/core.zip", "templates/shrift_font_template.pdf", "templates/template_spec.json"];
const ENGINE_FILES = ["pyodide_min/Pillow-10.0.0-cp311-cp311-emscripten_3_1_45_wasm32.whl", "pyodide_min/fonttools-4.42.1-py3-none-any.whl", "pyodide_min/lxml-4.9.3-cp311-cp311-emscripten_3_1_45_wasm32.whl", "pyodide_min/micropip-0.5.0-py3-none-any.whl", "pyodide_min/numpy-1.25.2-cp311-cp311-emscripten_3_1_45_wasm32.whl", "pyodide_min/package.json", "pyodide_min/packaging-23.1-py3-none-any.whl", "pyodide_min/pyodide-lock.json", "pyodide_min/pyodide.asm.js", "pyodide_min/pyodide.asm.wasm", "pyodide_min/pyodide.js", "pyodide_min/pyodide.mjs", "pyodide_min/python_docx-1.2.0-py3-none-any.whl", "pyodide_min/python_stdlib.zip", "pyodide_min/typing_extensions-4.12.2-py3-none-any.whl"];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(APP_CACHE)
            .then((cache) => Promise.all(APP_FILES.map(async (f) => {
                const response = await fetch(new Request(f, { cache: 'reload' }));
                if (!response.ok) throw new Error('install: ' + f + ' ' + response.status);
                await cache.put(f, await plain(response));
            })))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys
                .filter((k) => k.startsWith('shrift-') && k !== APP_CACHE && k !== ENGINE_CACHE)
                .map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

// Cloudflare Pages отвечает на /app.html редиректом на /app. Ответ после редиректа
// нельзя отдавать на навигацию (Chrome: ERR_FAILED), поэтому кладём и отдаём «чистую» копию.
async function plain(response) {
    if (!response.redirected) return response;
    return new Response(await response.blob(), { status: response.status, statusText: response.statusText, headers: response.headers });
}

function isEngine(url) {
    return url.pathname.includes('/pyodide_min/');
}

async function fromCacheOrNetwork(cacheName, request) {
    const cache = await caches.open(cacheName);
    const hit = await cache.match(request, { ignoreSearch: true });
    if (hit) return hit;
    const response = await plain(await fetch(request));
    if (response.ok) cache.put(request, response.clone());
    return response;
}

self.addEventListener('fetch', (event) => {
    const request = event.request;
    if (request.method !== 'GET') return;
    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;
    if (url.pathname.endsWith('/version.json')) return;   // проверка связи — только сеть
    if (isEngine(url)) {
        event.respondWith(fromCacheOrNetwork(ENGINE_CACHE, request));
    } else {
        event.respondWith(fromCacheOrNetwork(APP_CACHE, request));
    }
});

// Когда движок первый раз загрузился, страница просит положить его файлы в кэш
// (браузер обычно берёт их из своего HTTP-кэша, повторного скачивания нет).
self.addEventListener('message', (event) => {
    const data = event.data || {};
    if (data.type !== 'WARM_ENGINE') return;
    event.waitUntil(caches.open(ENGINE_CACHE).then(async (cache) => {
        for (const u of ENGINE_FILES) {
            if (await cache.match(u, { ignoreSearch: true })) continue;
            try {
                const response = await fetch(u);
                if (response.ok) await cache.put(u, response);
            } catch (e) { /* не страшно: докачаем при следующем заходе */ }
        }
    }));
});
