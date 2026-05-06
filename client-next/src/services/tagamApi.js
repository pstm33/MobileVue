import { runtimeConfig } from "@/config/runtime"

const DEFAULT_PUBLIC_TOKEN =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ0YWdhbS5kZWxpdmVyeSIsInN1YiI6ImQyYTJmODQwLTIzNDUtMTFmMS05YjU5LTEwNjY2YWU0YzRkMSIsImlhdCI6MTc3Mzg5MTgyMX0.r1fKj-V43XsICYacH6IPnahXrkvnGc2mSmB0c3zJfPM"

const interfaceBase = `${runtimeConfig.apiBaseUrl.replace(/\/$/, "")}/interface`
const publicToken = runtimeConfig.publicApiToken || DEFAULT_PUBLIC_TOKEN

async function request(path, options = {}) {
  const {
    method = "GET",
    query,
    body,
    form = false,
    clientToken = "",
    useClientToken = false,
  } = options

  const url = new URL(path.replace(/^\//, ""), `${interfaceBase}/`)

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, value)
      }
    })
  }

  const headers = {
    Accept: "application/json",
  }

  if (useClientToken && clientToken) {
    headers.Authorization = `token ${clientToken}`
  } else if (publicToken) {
    headers.Authorization = `Bearer ${publicToken}`
  }

  let payload = undefined
  if (body !== undefined) {
    if (form) {
      headers["Content-Type"] = "application/x-www-form-urlencoded;charset=UTF-8"
      payload = new URLSearchParams(body).toString()
    } else {
      headers["Content-Type"] = "application/json"
      payload = JSON.stringify(body)
    }
  }

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: payload,
  })

  const data = await response.json()

  if (data.code === 1 || data.code === 3) {
    return data
  }

  throw new Error(data.msg || "Request failed")
}

export function getBanner(coordinates) {
  return request("getBanner", {
    query: {
      latitude: coordinates?.latitude || "",
      longitude: coordinates?.longitude || "",
    },
  })
}

export function getAttributes(currencyCode = "") {
  return request("getAttributes", {
    method: "POST",
    form: true,
    body: {
      currency_code: currencyCode,
    },
  })
}

export function getCuisineList(rows = 12, query = "") {
  return request("CuisineList", {
    method: "POST",
    form: true,
    body: {
      rows,
      q: query,
    },
  })
}

export function getLocationAutocomplete(query) {
  return request("getlocationAutocomplete", {
    method: "POST",
    form: true,
    body: {
      q: query,
    },
  })
}

export function getLocationDetails(placeId, description) {
  return request("getLocationDetails", {
    method: "POST",
    form: true,
    body: {
      place_id: placeId,
      description,
    },
  })
}

export function searchSuggestion(query) {
  return request("searchSuggestion/", {
    query: {
      q: query,
    },
  })
}

export function searchCatalog(query, placeId, currencyCode = "") {
  return request("Search", {
    method: "POST",
    form: true,
    body: {
      q: query,
      place_id: placeId,
      currency_code: currencyCode,
    },
  })
}

export function getOrders(clientToken, orderType = "recent", page = 0) {
  return request("OrderList", {
    useClientToken: true,
    clientToken,
    query: {
      page,
      order_type: orderType,
    },
  })
}

export function authenticateClientToken(clientToken) {
  return request("authenticate", {
    method: "POST",
    form: true,
    body: {
      token: clientToken,
    },
  })
}

export function getOrderHistory(clientToken, page = 1, query = "", orderTab = "past_order") {
  return request("orderHistory", {
    method: "POST",
    form: true,
    useClientToken: true,
    clientToken,
    body: {
      page,
      q: query,
      order_tab: orderTab,
    },
  })
}

export function buyAgain(clientToken, orderUuid, cartUuid = "") {
  return request("orderBuyAgain", {
    method: "POST",
    useClientToken: true,
    clientToken,
    body: {
      order_uuid: orderUuid,
      cart_uuid: cartUuid,
    },
  })
}

export function getMerchantInfo(slug, coordinates) {
  return request("getMerchantInfo", {
    query: {
      slug,
      latitude: coordinates?.lat || "",
      longitude: coordinates?.lng || "",
    },
  })
}

export function getMerchantFeed(payload, clientToken = "") {
  return request(clientToken ? "getMerchantFeedAuth" : "getMerchantFeed", {
    method: "POST",
    body: payload,
    clientToken,
    useClientToken: Boolean(clientToken),
  })
}
