document.getElementById("formRegistro").addEventListener("submit", async (e) => {
    e.preventDefault();

    // Obtener valores del formulario
    const nombreUsuario = document.getElementById("nombreUsuario").value;
    const password = document.getElementById("Contraseña").value;

    // Validaciones básicas
    if (!nombreUsuario || !password) {
        alert("Todos los campos son obligatorios", "danger");
        return;
    }

    if (password.length < 6) {
        alert("La contraseña debe tener al menos 6 caracteres", "danger");
        return;
    }

    // Verificar primero si el usuario existe
    try {
        // Llamada GET para verificar existencia
        const checkResponse = await fetch(`http://localhost:5000/api/usuarios/existe?nombreUsuario=${encodeURIComponent(nombreUsuario)}`);
        
        if (checkResponse.ok) {
            const existe = await checkResponse.json();
            if (existe) {
                alert("Este nombre de usuario ya está registrado", "danger");
                return; // Detener el proceso si ya existe
            }
        } else {
            throw new Error("Error al verificar usuario");
        }

        // Si no existe, proceder con el registro
        const usuario = {
            nombreUsuario: nombreUsuario,
            password: password
        };

        const response = await fetch("http://localhost:5000/api/usuarios", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(usuario)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.title || "Error al registrar usuario");
        }

        const data = await response.json();
        alert(`Usuario ${data.nombreUsuario} registrado con éxito!`, "success");
        window.location.href = "Login.html";
        document.getElementById("formRegistro").reset();

    } catch (error) {
        console.error("Error:", error);
        alert(error.message, "danger");
    }
});

