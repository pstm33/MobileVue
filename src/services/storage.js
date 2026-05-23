const encode = (value) => JSON.stringify(value);

const decode = (value) => {
  if (value === null || typeof value === "undefined") return null;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const createStorage = (driver) => ({
  set(key, value) {
    driver.setItem(key, encode(value));
  },
  getItem(key) {
    return decode(driver.getItem(key));
  },
  has(key) {
    return driver.getItem(key) !== null;
  },
  remove(key) {
    driver.removeItem(key);
  },
});

export const LocalStorage = createStorage(window.localStorage);
export const SessionStorage = createStorage(window.sessionStorage);
