import axios from "axios";
import config from "src/api/config";

const api = axios.create({
  baseURL: `${config.api_base_url}/interface`,
  timeout: 30000,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization: config.api_token ? `Bearer ${config.api_token}` : "",
  },
});

export { api, axios };
