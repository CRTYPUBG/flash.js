export const storage = {
  get(key, fallback = null) {
    try { const raw = localStorage.getItem(key); return raw === null ? fallback : JSON.parse(raw); } catch { return fallback; }
  },
  set(key, value) { localStorage.setItem(key, JSON.stringify(value)); return value; },
  remove(key) { localStorage.removeItem(key); },
  clear() { localStorage.clear(); },
  has(key) { return localStorage.getItem(key) !== null; },
  session: {
    get(k, fb=null) { try{ const r=sessionStorage.getItem(k); return r===null?fb:JSON.parse(r);}catch{return fb;}},
    set(k,v){ sessionStorage.setItem(k, JSON.stringify(v)); return v; },
    remove(k){ sessionStorage.removeItem(k); },
    clear(){ sessionStorage.clear(); },
    has(k){ return sessionStorage.getItem(k)!==null; }
  }
};

export default storage;
