📊 DataLens APT
DataLens es una aplicación web diseñada para que pequeñas y medianas empresas (PYMEs) puedan analizar sus datos fácilmente a partir de archivos CSV.
La plataforma genera automáticamente KPI’s, dashboards interactivos y análisis predictivos básicos de Machine Learning, ayudando a los usuarios a tomar decisiones basadas en datos sin necesidad de conocimientos técnicos avanzados.

---

🚀 Características principales
Subida de archivos CSV y almacenamiento en base de datos NoSQL (MongoDB Atlas).
Limpieza y validación de datos cargados.
Generación automática de indicadores clave (KPI’s).
Visualizaciones dinámicas con gráficos interactivos.
Modelos básicos de Machine Learning (predicción de ventas, clustering de clientes).
Gestión de usuarios y autenticación segura.
Interfaz web intuitiva desarrollada en React + TailwindCSS.

---

🛠️ Tecnologías utilizadas
Frontend
React.js
TailwindCSS
Chart.js / Recharts
Axios

Backend
Node.js + Express
Mongoose (ODM para MongoDB)
Multer + csv-parse (para carga y parsing de CSV)

Base de datos
MongoDB Atlas (NoSQL, cloud)

Microservicio ML
Python 3 + FastAPI
Pandas, Numpy, Scikit-learn
PyMongo

DevOps / Herramientas
GitHub (control de versiones y gestión de proyecto)
Vercel (frontend hosting)
Render / Heroku (backend y ML service)
MongoDB Compass (cliente visual)

---

📂 Estructura del repositorio
datalens-apt/
│
├── backend/ # API REST con Node.js + Express
├── frontend/ # Interfaz web (React + Tailwind)
├── ml_service/ # Microservicio de Machine Learning (FastAPI)
├── docs/ # Documentación (informes, plan de trabajo, diagramas)
├── .gitignore # Ignorar node_modules, venv, .env
└── README.md # Este archivo


---
📌 Planificación y metodología

El proyecto se desarrolla con la metodología ágil Scrum, trabajando en sprints de 2 semanas.

Scrum Master: Joaquín

Product Owner: Lucas
---
⚙️ Instalación y ejecución
Clonar el repositorio
```bash
git clone https://github.com/<usuario>/datalens-apt.git
cd datalens-apt
Backend
cd backend
npm install
npm run dev   # con nodemon

Frontend
cd frontend
npm install
npm start

Microservicio ML
cd ml_service
python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001

Variables de entorno

Crear archivo .env en backend/:

MONGO_URI=mongodb+srv://<usuario>:<password>@cluster.mongodb.net/datalens
JWT_SECRET=changeme
PORT=3000

Herramientas de gestión: GitHub Projects / Trello
👥 Autores

Joaquín Navarro – Backend, Machine Learning, Scrum Master

Lucas [Apellido] – Frontend, Visualización, Product Owner
