document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formLogin");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombreUsuario = document.getElementById("loginUsuario").value.trim();
    const password      = document.getElementById("loginContraseña").value;

    if (!nombreUsuario || !password) {
      Swal.fire({ icon: 'warning', title: 'Atención', text: 'Todos los campos son obligatorios' });
      return;
    }
    if (password.length < 6) {
      Swal.fire({ icon: 'warning', title: 'Atención', text: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }

    const params = new URLSearchParams({ nombreUsuario, password });

    try {
      const response = await fetch(`http://localhost:5000/api/usuarios/login?${params.toString()}`);

      if (response.status === 401) {
        const err = await response.json();
        Swal.fire({ icon: 'error', title: 'Error', text: err.mensaje });
        return;
      }
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.mensaje || "Error al iniciar sesión");
      }

      // Login exitoso: mostramos SweetAlert y redirigimos al confirmar
      const { mensaje, id } = await response.json();
      localStorage.setItem("userId", id);
      localStorage.setItem("usuario", nombreUsuario); 
      Swal.fire({
        title: '¡Éxito!',
        text: mensaje,
        icon: 'success',

        background: '#000000',
        color: '#FFD700',
        confirmButtonText: 'Continuar',
        confirmButtonColor: '#FFD700',
        iconColor: '#FFD700',

        customClass: {
            popup: 'swal2-popup--custom',
            title: 'swal2-title--gold',
            content: 'swal2-content--gold',
            confirmButton: 'swal2-confirm--gold'
        }
      }).then(() => {
        window.location.href = "Criptomonedas.html";
      });

    } catch (error) {
      console.error("Login error:", error);
      Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    }
  });
});
