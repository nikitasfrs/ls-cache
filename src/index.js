/**
 * localStorage caching 
 *
 * Use unique keys and/or a keyNormalizer function for efficiency.
 *
 * @param {Object} opt - Option object.
 * @param {integer=100} opt.maxEntries - Maximum entries to be cached.
 * @param {mountIn='__ls-cache__'} opt.mountIn - Root key under items will be stored.
 * @param {string='custom'} opt.namespace - Namespace used in root key.
 * @param {integer=30} opt.cacheMinutes - Minutes each item will be stored.
 * @param {integer=1} opt.version - Cache version.
 * @param {function} opt.keyNormalizer - Normalizer function used in setters and getters.
 *
 * @author Nikitas Frantzeskakis
 *
 */
export default class Cache {
  constructor ({
    maxEntries = 100,
    mountIn = '__ls-cache__',
    namespace = 'custom',
    cacheMinutes = 30,
    version = 1,
    keyNormalizer = (key) => key
  }) {
    this.namespace = namespace;
    this.version = version;
    this.storageKey = `${mountIn}/${namespace}/${version}`;
    this.storage = this.getStorage();
    
    this.normalizeKey = keyNormalizer;
    this.maxEntries = maxEntries;
    this.cacheMinutes = cacheMinutes;

    this.flushPreviousVersion();
  }
  flushPreviousVersion() {
    const { namespace, version } = this;
    if (version > 1) {
      try {
        for (let i = version; i > 0; i--) {
          window.localStorage.removeItem(`${mountIn}/${namespace}/${i}`);
        }
      } catch (err) {} // eslint-disable-line no-empty
    }
  }
  getStorage () {
    if (window.localStorage) {
      const storedStorage = window.localStorage.getItem(this.storageKey);

      if (storedStorage) {
        return this.jsonToMap(storedStorage);
      }
    }
    return new Map();

  }
  setStorage(storage) {
    this.storage = storage;
    if (window.localStorage) {
      try {
        window.localStorage.setItem(this.storageKey, this.mapToJson(storage));
      } catch (err) {
        window.localStorage.setItem(this.storageKey, this.mapToJson(new Map()));
      }
    }
  }
  mapToJson(map = new Map()) {
    try {
      return JSON.stringify(Array.from(map));
    } catch (err) {} // eslint-disable-line no-empty
  }
  jsonToMap(jsonStr) {
    try {
      return new Map(JSON.parse(jsonStr));
    } catch (err) {
      return new Map();
    }
  }
  has(key) {
    const normalizedKey = this.normalizeKey(key);
    if (!this.storage.has(normalizedKey)) {
      return false;
    }
    const now = new Date().getTime();
    try {
      const { __timestamp__ } = JSON.parse(this.storage.get(normalizedKey));
      if (((now - __timestamp__) / 60000) >= this.cacheMinutes) { // cleanup expired
        this.storage.delete(normalizedKey);
        this.setStorage(this.storage);
        return false;
      }
      return true;
    } catch (err) {
      return false;
    }
  }
  get(key) {
    if (!this.has(key)) {
      return null;
    }
    try {
      const normalizedKey = this.normalizeKey(key);
      return JSON.parse(this.storage.get(normalizedKey)).value
    } catch (err) {
      return null;
    }
  }
  set(key, value) {
    const result = {
      __timestamp__: new Date().getTime(),
      value
    };

    if (this.storage.size === this.maxEntries) {
      // max size reached, delete first item
      const firstKey = this.storage.keys().next().value;
      this.storage.delete(firstKey);
    }
    try {
      const normalizedKey = this.normalizeKey(key);
      const storage = this.storage.set(normalizedKey, JSON.stringify(result));
      this.setStorage(storage);
    } catch (err) {} // eslint-disable-line no-empty
  }
}
