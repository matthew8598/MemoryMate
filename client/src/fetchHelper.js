async function Call(baseUri, useCase, dtoIn, method) {
  let response;
  if (!method || method === "get") {
    response = await fetch(
      `${baseUri}/${useCase}${
        dtoIn && Object.keys(dtoIn).length
          ? `?${new URLSearchParams(dtoIn)}`
          : ""
      }`
    );
  } else {
    response = await fetch(`${baseUri}/${useCase}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dtoIn),
    });
  }
  const data = await response.json();
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