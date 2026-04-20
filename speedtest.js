function Speedtest() {
  this._serverList = [];
  this._selectedServer = null;
  this._settings = {};
  this._state = 0;
  console.log(
    "LibreSpeed by Federico Dossena v6.0.2 - Modified with Ookla public servers - https://github.com/librespeed/speedtest"
  );
}

Speedtest.prototype = {
  constructor: Speedtest,
  getState: function() {
    return this._state;
  },
  setParameter: function(parameter, value) {
    if (this._state == 3)
      throw "You cannot change the test settings while running the test";
    this._settings[parameter] = value;
    if (parameter === "telemetry_extra") {
      this._originalExtra = this._settings.telemetry_extra;
    }
  },
  _checkServerDefinition: function(server) {
    try {
      if (typeof server.name !== "string")
        throw "Name string missing from server definition (name)";
      if (typeof server.server !== "string")
        throw "Server address string missing from server definition (server)";
      if (server.server.charAt(server.server.length - 1) != "/")
        server.server += "/";
      if (server.server.indexOf("//") == 0)
        server.server = location.protocol + server.server;
      if (typeof server.dlURL !== "string")
        throw "Download URL string missing from server definition (dlURL)";
      if (typeof server.ulURL !== "string")
        throw "Upload URL string missing from server definition (ulURL)";
      if (typeof server.pingURL !== "string")
        throw "Ping URL string missing from server definition (pingURL)";
      if (typeof server.getIpURL !== "string")
        throw "GetIP URL string missing from server definition (getIpURL)";
    } catch (e) {
      throw "Invalid server definition";
    }
  },
  addTestPoint: function(server) {
    this._checkServerDefinition(server);
    if (this._state == 0) this._state = 1;
    if (this._state != 1) throw "You can't add a server after server selection";
    this._settings.mpot = true;
    this._serverList.push(server);
  },
  addTestPoints: function(list) {
    for (let i = 0; i < list.length; i++) this.addTestPoint(list[i]);
  },
  loadServerList: function(url, result) {
    if (this._state == 0) this._state = 1;
    if (this._state != 1) throw "You can't add a server after server selection";
    this._settings.mpot = true;
    let xhr = new XMLHttpRequest();
    xhr.onload = function() {
      try {
        const servers = JSON.parse(xhr.responseText);
        for (let i = 0; i < servers.length; i++) {
          this._checkServerDefinition(servers[i]);
        }
        this.addTestPoints(servers);
        result(servers);
      } catch (e) {
        result(null);
      }
    }.bind(this);
    xhr.onerror = function() {
      result(null);
    };
    xhr.open("GET", url);
    xhr.send();
  },
  /**
   * Fetch public servers from Ookla's Speedtest API (unofficial)
   * limit: max number of servers (max 20)
   * search: optional search term (e.g., "Jakarta")
   * callback: function(servers) where servers is array of formatted server objects (null if error)
   */
  fetchPublicServers: function(limit, search, callback) {
    if (typeof limit !== "number") limit = 10;
    if (limit > 20) limit = 20;
    let url = "https://www.speedtest.net/api/js/servers?engine=js&https_functional=true&limit=" + limit;
    if (search && typeof search === "string") url += "&search=" + encodeURIComponent(search);
    
    fetch(url)
      .then(response => {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.json();
      })
      .then(data => {
        if (!Array.isArray(data)) throw new Error("Invalid response");
        let servers = [];
        for (let s of data) {
          let serverUrl = "https://" + s.host + "/";
          let name = s.sponsor + " - " + s.name;
          servers.push({
            name: name,
            server: serverUrl,
            dlURL: "garbage.php",
            ulURL: "empty.php",
            pingURL: "empty.php",
            getIpURL: "getIP.php"
          });
        }
        if (callback) callback(servers);
      })
      .catch(err => {
        console.error("Failed to fetch public servers:", err);
        if (callback) callback(null);
      });
  },
  /**
   * Fetch public servers from Ookla and add them as test points.
   * limit: max number of servers (default 10)
   * search: optional search term
   * callback: function(success, serversAdded)
   */
  addPublicServers: function(limit, search, callback) {
    if (this._state == 0) this._state = 1;
    if (this._state != 1) throw "You can't add servers after server selection";
    this.fetchPublicServers(limit, search, (servers) => {
      if (!servers || servers.length === 0) {
        if (callback) callback(false, []);
        return;
      }
      try {
        this.addTestPoints(servers);
        if (callback) callback(true, servers);
      } catch (e) {
        console.error(e);
        if (callback) callback(false, []);
      }
    });
  },
  getSelectedServer: function() {
    if (this._state < 2 || this._selectedServer == null)
      throw "No server is selected";
    return this._selectedServer;
  },
  setSelectedServer: function(server) {
    this._checkServerDefinition(server);
    if (this._state == 3)
      throw "You can't select a server while the test is running";
    this._selectedServer = server;
    this._state = 2;
  },
  selectServer: function(result) {
    if (this._state != 1) {
      if (this._state == 0) throw "No test points added";
      if (this._state == 2) throw "Server already selected";
      if (this._state >= 3)
        throw "You can't select a server while the test is running";
    }
    if (this._selectServerCalled) throw "selectServer already called";
    else this._selectServerCalled = true;
    
    const select = function(serverList, selected) {
      const PING_TIMEOUT = 2000;
      let USE_PING_TIMEOUT = true;
      if (/MSIE.(\d+\.\d+)/i.test(navigator.userAgent)) {
        USE_PING_TIMEOUT = false;
      }
      const ping = function(url, rtt) {
        url += (url.match(/\?/) ? "&" : "?") + "cors=true";
        let xhr = new XMLHttpRequest();
        let t = new Date().getTime();
        xhr.onload = function() {
          if (xhr.responseText.length == 0) {
            let instspd = new Date().getTime() - t;
            try {
              let p = performance.getEntriesByName(url);
              p = p[p.length - 1];
              let d = p.responseStart - p.requestStart;
              if (d <= 0) d = p.duration;
              if (d > 0 && d < instspd) instspd = d;
            } catch (e) {}
            rtt(instspd);
          } else rtt(-1);
        }.bind(this);
        xhr.onerror = function() {
          rtt(-1);
        }.bind(this);
        xhr.open("GET", url);
        if (USE_PING_TIMEOUT) {
          try {
            xhr.timeout = PING_TIMEOUT;
            xhr.ontimeout = xhr.onerror;
          } catch (e) {}
        }
        xhr.send();
      }.bind(this);
      const PINGS = 3, SLOW_THRESHOLD = 500;
      const checkServer = function(server, done) {
        let i = 0;
        server.pingT = -1;
        if (server.server.indexOf(location.protocol) == -1) done();
        else {
          const nextPing = function() {
            if (i++ == PINGS) {
              done();
              return;
            }
            ping(
              server.server + server.pingURL,
              function(t) {
                if (t >= 0) {
                  if (t < server.pingT || server.pingT == -1) server.pingT = t;
                  if (t < SLOW_THRESHOLD) nextPing();
                  else done();
                } else done();
              }.bind(this)
            );
          }.bind(this);
          nextPing();
        }
      }.bind(this);
      let i = 0;
      const done = function() {
        let bestServer = null;
        for (let i = 0; i < serverList.length; i++) {
          if (
            serverList[i].pingT != -1 &&
            (bestServer == null || serverList[i].pingT < bestServer.pingT)
          )
            bestServer = serverList[i];
        }
        selected(bestServer);
      }.bind(this);
      const nextServer = function() {
        if (i == serverList.length) {
          done();
          return;
        }
        checkServer(serverList[i++], nextServer);
      }.bind(this);
      nextServer();
    }.bind(this);
    const CONCURRENCY = 6;
    let serverLists = [];
    for (let i = 0; i < CONCURRENCY; i++) {
      serverLists[i] = [];
    }
    for (let i = 0; i < this._serverList.length; i++) {
      serverLists[i % CONCURRENCY].push(this._serverList[i]);
    }
    let completed = 0;
    let bestServer = null;
    for (let i = 0; i < CONCURRENCY; i++) {
      select(
        serverLists[i],
        function(server) {
          if (server != null) {
            if (bestServer == null || server.pingT < bestServer.pingT)
              bestServer = server;
          }
          completed++;
          if (completed == CONCURRENCY) {
            this._selectedServer = bestServer;
            this._state = 2;
            if (result) result(bestServer);
          }
        }.bind(this)
      );
    }
  },
  start: function() {
    if (this._state == 3) throw "Test already running";
    this.worker = new Worker("speedtest_worker.js?r=" + Math.random());
    this.worker.onmessage = function(e) {
      if (e.data === this._prevData) return;
      else this._prevData = e.data;
      const data = JSON.parse(e.data);
      try {
        if (this.onupdate) this.onupdate(data);
      } catch (e) {
        console.error("Speedtest onupdate event threw exception: " + e);
      }
      if (data.testState >= 4) {
        clearInterval(this.updater);
        this._state = 4;
        try {
          if (this.onend) this.onend(data.testState == 5);
        } catch (e) {
          console.error("Speedtest onend event threw exception: " + e);
        }
      }
    }.bind(this);
    this.updater = setInterval(
      function() {
        this.worker.postMessage("status");
      }.bind(this),
      200
    );
    if (this._state == 1)
      throw "When using multiple points of test, you must call selectServer before starting the test";
    if (this._state == 2) {
      this._settings.url_dl =
        this._selectedServer.server + this._selectedServer.dlURL;
      this._settings.url_ul =
        this._selectedServer.server + this._selectedServer.ulURL;
      this._settings.url_ping =
        this._selectedServer.server + this._selectedServer.pingURL;
      this._settings.url_getIp =
        this._selectedServer.server + this._selectedServer.getIpURL;
      if (typeof this._originalExtra !== "undefined") {
        this._settings.telemetry_extra = JSON.stringify({
          server: this._selectedServer.name,
          extra: this._originalExtra
        });
      } else
        this._settings.telemetry_extra = JSON.stringify({
          server: this._selectedServer.name
        });
    }
    this._state = 3;
    this.worker.postMessage("start " + JSON.stringify(this._settings));
  },
  abort: function() {
    if (this._state < 3) throw "You cannot abort a test that's not started yet";
    if (this._state < 4) this.worker.postMessage("abort");
  }
};