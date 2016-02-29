document.addEventListener("DOMContentLoaded", function () {
    if (window.PeerioDebug && PeerioDebug.logLevel != null) {
        L.level = PeerioDebug.logLevel;
        L.releaseConsole();
    }
    window.devmode = {
        root: document.getElementById('devmode'), // root devmode dom node
        logNode: document.getElementById('devmode-log'), // root devmode dom node
        summonCounter: 0,              // summon() calls count in current 'session'
        summonTimeout: null,           // current session timeout id (setTimeout result)
        summonCounterThreshold: 10,    // summon() will open devmode after this amount of calls
        summonTimeoutThreshold: 10000, // summonCounter will reset if it didn't reach threshold within this number of milliseconds
        // open devmode control
        show: function () {
            /* making sure that devmode isn't compressed into small scrollable window */
            if (Peerio && Peerio.NativeAPI && Peerio.NativeAPI.hideKeyboard) {
                Peerio.NativeAPI.hideKeyboard();
            }
            devmode.loadSettings();
            devmode.root.className = 'devmode-visible';
            devmode.populateLog();
            devmode.interval = setInterval(function () {
                if (!L.cache.length) return;
                if (devmode.lastLog && devmode.lastLog === L.cache[0]) return;
                devmode.lastLog = L.cache[0];
                devmode.populateLog();
            }, 1000);
        },
        // closes devmode control
        hide: function () {
            devmode.root.className = 'devmode-hidden';
            clearInterval(devmode.interval);
            devmode.logNode.innerHTML = '';
        },
        // call this function N times within T seconds to open devmode
        summon: function (e) {
            if (e) e.preventDefault();
            devmode.summonCounter++;
            if (devmode.summonTimeout === null) devmode.summonTimeout = setTimeout(devmode.resetSummon, 15000);
            if (devmode.summonCounter < 10) return;
            devmode.show();
            devmode.resetSummon();
        },
        resetSummon: function (e) {
            if (e) e.preventDefault();
            if (devmode.summonTimeout !== null) clearTimeout(devmode.summonTimeout);
            devmode.summonTimeout = null;
            devmode.summonCounter = 0;
        },
        send: function () {
            cordova.plugins.email.open({
                to: 'anri@peerio.com',
                subject: 'Peerio error report.',
                body: devmode.logNode.innerHTML,
                isHtml: true
            });
        },
        changeLogLevel: function (event) {
            L.level = +event.target.value;
            L.setWorkersOptions({level: L.level});
            devmode.loadSettings();
        },
        changeLogBenchmark: function (event) {
            L.benchmarkEnabled = !!event.target.checked;
            L.setWorkersOptions({benchmarkEnabled: L.benchmarkEnabled});
            devmode.loadSettings();
        },
        changeLogLimit: function (event) {
            L.cacheLimit = isNaN(+event.target.value) ? 100 : +event.target.value;
            devmode.loadSettings();
        },
        populateLog: function () {
            var head = "<div class='devmode-log-item'>";
            var tail = "</div>";
            var mid = tail + head;
            devmode.logNode.innerHTML = (head + L.cache.join(mid) + tail)
                .replace(/ ERR:/gm, "<span class='logitem-err'> ERR:</span>")
                .replace(/ BNC:/gm, "<span class='logitem-bnc'> BNC:</span>");
        },
        loadSettings: function () {
            document.getElementById('devmode-log-level').value = L.level;
            document.getElementById('devmode-bench').checked = L.B.enabled;
            document.getElementById('devmode-log-limit').value = L.cacheLimit;
        }
    };

    document.getElementById('devmode-close').onclick = devmode.hide;
    document.getElementById('devmode-send').onclick = devmode.send;
    document.getElementById('devmode-log-level').onchange = devmode.changeLogLevel;
    document.getElementById('devmode-bench').onchange = devmode.changeLogBenchmark;
    document.getElementById('devmode-log-limit').onchange = devmode.changeLogLimit;
});
