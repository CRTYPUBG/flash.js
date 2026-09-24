const http = {
  async request(url, options = {}) {
    const { body, json, headers, timeout, ...rest } = options;
    const controller = new AbortController();
    const timer = timeout ? setTimeout(() => controller.abort(), timeout) : null;

    let payload = body;
    const finalHeaders = { ...(headers || {}) };

    if (json !== undefined) {
      payload = JSON.stringify(json);
      if (!finalHeaders["Content-Type"] && !finalHeaders["content-type"]) finalHeaders["Content-Type"] = "application/json";
    }

    try {
      const res = await fetch(url, { ...rest, body: payload, headers: finalHeaders, signal: controller.signal });
      if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status} ${res.statusText}`), { status: res.status, response: res });
      return res;
    } finally {
      if (timer) clearTimeout(timer);
    }
  },
  async json(url, options) { return (await http.request(url, options)).json(); },
  async text(url, options) { return (await http.request(url, options)).text(); },
  async blob(url, options) { return (await http.request(url, options)).blob(); },
  async arrayBuffer(url, options) { return (await http.request(url, options)).arrayBuffer(); },
  get(url, options = {})         { return http.request(url, { ...options, method: "GET" }); },
  post(url, body, options = {})  { return http.request(url, { ...options, method: "POST", body }); },
  put(url, body, options = {})   { return http.request(url, { ...options, method: "PUT", body }); },
  patch(url, body, options = {}) { return http.request(url, { ...options, method: "PATCH", body }); },
  delete(url, options = {})      { return http.request(url, { ...options, method: "DELETE" }); },
};

export { http as default, http };
