const API_URL = "http://localhost:5000/api"

export async function apiFetch(endpoint, method = "GET", body = null, token = null) {
    const headers = { "Content-Type": "application/json" };

    // Si viene el token, lo agregamos a los headers
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    try {
        console.log(`Realizando petición a: ${API_URL}${endpoint}`);
        
        const response = await fetch(`${API_URL}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : null,
        });

        // Intenta obtener la respuesta JSON
        let data;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            const text = await response.text();
            console.warn("Respuesta no JSON:", text);
            data = { message: text };
        }

        // Si la respuesta no es exitosa, lanza un error
        if (!response.ok) {
            throw new Error(data.error || data.message || "Error en la solicitud");
        }

        return data;
    } catch (error) {
        console.error("Error en apiFetch:", error.message);
        throw error;
    }
}