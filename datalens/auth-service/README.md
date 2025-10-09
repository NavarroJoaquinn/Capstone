# 🔑 Auth Service – DataLens Analytics

Microservicio de autenticación para **DataLens Analytics**.  
Implementado en **FastAPI** con soporte para **JWT (JSON Web Tokens)**.  

Permite a los usuarios:
- Registrarse (`/auth/register`)
- Iniciar sesión (`/auth/login`)
- Consultar sus datos autenticados (`/auth/me`)

---

## 🚀 Endpoints principales

### 1. Registro de usuario – `/auth/register`

- **Método:** `POST`
- **Descripción:** Crea un nuevo usuario en la base de datos y devuelve un **token JWT válido**.
- **Uso típico:** cuando un usuario se registra por primera vez.

**Ejemplo (curl):**
```bash
curl -X POST "http://127.0.0.1:8000/auth/register" \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
        "email": "demo@empresa.com",
        "password": "123456",
        "company_name": "MiEmpresa"
      }'


Respuesta esperada:
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}


2. Inicio de sesión – /auth/login

Método: POST

Descripción: Valida credenciales de un usuario ya registrado y devuelve un token JWT.

Uso típico: cuando un usuario ya existe y quiere iniciar sesión nuevamente.

Ejemplo (curl):
curl -X POST "http://127.0.0.1:8000/auth/login" \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
        "email": "demo@empresa.com",
        "password": "123456"
      }'


Respuesta esperada:
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}

3. Verificar identidad – /auth/me

Método: GET

Descripción: Devuelve los datos del usuario autenticado usando el JWT en los headers.

Header requerido:

Authorization: Bearer <token>

Ejemplo (curl):
curl -X GET "http://127.0.0.1:8000/auth/me" \
  -H "accept: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."

Respuesta esperada:
{
  "email": "demo@empresa.com",
  "company_name": "MiEmpresa"
}


🔄 Flujo de uso
🔹 Nuevo usuario

POST /auth/register → crea cuenta y devuelve token

GET /auth/me → obtiene datos autenticados

🔹 Usuario existente

POST /auth/login → inicia sesión y devuelve token

GET /auth/me → obtiene datos autenticados

🛠️ Tecnologías utilizadas

FastAPI

PyMongo (MongoDB Atlas)

Passlib (hash de contraseñas)

JWT (PyJWT)

⚡ Notas

El token tiene expiración (configurable en .env).

Guarda las contraseñas en formato seguro (bcrypt).

Para pruebas, puedes usar Swagger UI en:
👉 http://127.0.0.1:8000/docs