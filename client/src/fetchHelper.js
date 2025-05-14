async function Call(baseUri, useCase, dtoIn = null, method = "get") {
  let response;

  const url = `${baseUri}/${useCase}`;

  if (method.toLowerCase() === "get") {
    const query = dtoIn && Object.keys(dtoIn).length
      ? `?${new URLSearchParams(dtoIn)}`
      : "";
    response = await fetch(`${url}${query}`);
  } else {
    response = await fetch(url, {
      method: method.toUpperCase(),
      headers: { "Content-Type": "application/json" },
      body: dtoIn ? JSON.stringify(dtoIn) : null,
    });
  }

  const data = await response.json().catch(() => ({})); // fallback if no JSON
  return { ok: response.ok, status: response.status, data };
}
const baseUri = "https://localhost:3000";

const FetchHelper = {
  entry: {
    getAll: async () => {
      return await Call(baseUri, "entries/entries", null, "get");
    },
    create: async (dtoIn) => {
      return await Call(baseUri, "entries/", dtoIn, "post");
    },
    delete: async (id) => {
      return await Call(baseUri, `entries/${id}`, null, "delete");
    },
  },

  list: {
    getAll: async () => {
      return await Call(baseUri, "lists/", null, "get");
    },
    getDashboard: async () => {
      return await Call(baseUri, "lists/dashboard", null, "get");
    },
  },
};

export default FetchHelper;