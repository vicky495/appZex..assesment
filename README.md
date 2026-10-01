\# AppZex SaaS — Multi-Tenant Agency Project Management Platform



A multi-tenant SaaS platform for digital agencies to manage clients, projects, milestones, tasks, files, and project progress with role-based access control and backend-enforced tenant isolation.



\## 🚀 Overview



AppZex SaaS provides separate workspaces for:



\* Agency administrators and team members

\* Clients

\* Super administrators



The platform is designed around strict tenant isolation so that users can only access resources belonging to their authorized agency or client scope.



\## ✨ Features



\### Authentication \& Authorization



\* JWT-based authentication

\* Password hashing

\* Role-based authorization

\* Protected backend API routes

\* Separate access for:



&#x20; \* `SUPER\_ADMIN`

&#x20; \* `AGENCY\_ADMIN`

&#x20; \* `AGENCY\_TEAM`

&#x20; \* `CLIENT`



\### Agency Workspace



Agency users can:



\* View dashboard statistics

\* Manage clients

\* View projects

\* Create and manage project milestones

\* Create and manage tasks

\* Set task priority

\* Set task due dates

\* Assign tasks to agency team members

\* Update task status



\### Client Portal



Clients have a separate portal where they can:



\* View their assigned projects

\* View project status

\* Access only resources permitted for their client account



\### Project Management



Each project can contain:



\* Client information

\* Project status

\* Milestones

\* Tasks

\* Task descriptions

\* Task priorities

\* Due dates

\* Task assignees

\* Task status



\### File Management



The backend supports:



\* File uploads

\* Project-specific file listing

\* Protected file downloads

\* File metadata storage

\* Agency-level ownership validation



Uploaded files are stored outside the Git repository through the project's ignored `uploads/` directory.



\### AI Project Summary



The backend includes an AI project-summary module/controller intended to generate project-level summaries from project information.



The AI API configuration is environment-based so API credentials are not stored in source control.



\## 🏗️ Technology Stack



\### Frontend



\* React

\* Vite

\* React Router

\* Axios

\* JavaScript

\* CSS



\### Backend



\* Node.js

\* Express.js

\* JWT

\* Multer

\* Prisma ORM



\### Database



\* MySQL

\* Prisma migrations



\### Security



\* JWT authentication

\* Password hashing

\* Role-based access control

\* Agency-level tenant isolation

\* Client-level authorization

\* Protected file access

\* Environment-based secrets



> Note: The original assessment specifies Next.js for the frontend. The submitted implementation uses React + Vite with React Router.



\## 📁 Project Structure



```text

appzex-saas/

│

├── backend/

│   ├── prisma/

│   │   ├── migrations/

│   │   ├── schema.prisma

│   │   └── seed.js

│   │

│   └── src/

│       ├── controllers/

│       │   ├── activityController.js

│       │   ├── agencyController.js

│       │   ├── aiController.js

│       │   ├── authController.js

│       │   ├── clientController.js

│       │   ├── clientPortalController.js

│       │   ├── feedbackController.js

│       │   ├── fileController.js

│       │   ├── meetingController.js

│       │   ├── projectController.js

│       │   └── taskController.js

│       │

│       ├── middleware/

│       │   ├── authMiddleware.js

│       │   └── roleMiddleware.js

│       │

│       ├── routes/

│       │   ├── activityRoutes.js

│       │   ├── agencyRoutes.js

│       │   ├── aiRoutes.js

│       │   ├── authRoutes.js

│       │   ├── clientPortalRoutes.js

│       │   ├── clientRoutes.js

│       │   ├── feedbackRoutes.js

│       │   ├── fileRoutes.js

│       │   ├── meetingRoutes.js

│       │   ├── projectRoutes.js

│       │   └── taskRoutes.js

│       │

│       ├── utils/

│       │   └── prisma.js

│       │

│       └── server.js

│

├── frontend/

│   ├── public/

│   ├── src/

│   │   ├── Admin.jsx

│   │   ├── AgencyClients.jsx

│   │   ├── AgencyDashboard.jsx

│   │   ├── AgencyProjects.jsx

│   │   ├── ClientPortal.jsx

│   │   ├── ProjectDetails.jsx

│   │   ├── api.js

│   │   ├── App.jsx

│   │   └── main.jsx

│   │

│   ├── package.json

│   └── vite.config.js

│

├── .gitignore

└── README.md

```



\## 🔐 Multi-Tenancy \& Security



Tenant isolation is enforced on the backend rather than relying only on frontend navigation.



For agency-owned resources, queries use the authenticated user's `agencyId`.



For example, project access is scoped using the authenticated agency:



```javascript

const project = await prisma.project.findFirst({

&#x20; where: {

&#x20;   id: projectId,

&#x20;   agencyId: req.user.agencyId,

&#x20; },

});

```



File downloads also validate the agency associated with the project:



```javascript

const file = await prisma.file.findFirst({

&#x20; where: {

&#x20;   id: fileId,

&#x20;   project: {

&#x20;     agencyId: req.user.agencyId,

&#x20;   },

&#x20; },

});

```



This prevents users from accessing resources simply by changing an ID in an API request.



\## 🛡️ Security Testing



The following authorization and isolation tests were performed against the running application.



| Security Test                      | Expected |  Result |

| ---------------------------------- | -------: | ------: |

| Agency user → Super Admin endpoint |   Denied | ✅ `403` |

| Agency 2 → Agency 1 project        |   Denied | ✅ `404` |

| Client 2 → Client 1 project        |   Denied | ✅ `403` |

| Client → Agency clients API        |   Denied | ✅ `403` |

| Client → Agency files API          |   Denied | ✅ `403` |



\### Example: Cross-Agency Project Test



An agency user belonging to Agency 2 attempted to access a project belonging to Agency 1.



```text

GET /api/projects/1

→ 404 Not Found

```



\### Example: Cross-Client Project Test



A client attempted to access another client's project.



```text

GET /api/projects/1

→ 403 Forbidden

```



\### Example: Client → Agency API Test



A client attempted to access the agency client-management API.



```text

GET /api/clients

→ 403 Forbidden

```



\### Example: Client → Files API Test



A client attempted to access the agency file API.



```text

GET /api/files/project/2

→ 403 Forbidden

```



\## 🗄️ Database



The application uses MySQL with Prisma ORM.



The Prisma schema contains entities for the main SaaS hierarchy, including:



\* Users

\* Agencies

\* Agency members

\* Clients

\* Projects

\* Milestones

\* Tasks

\* Meetings

\* Feedback / change requests

\* Files

\* Activity logs



Prisma migrations are included in:



```text

backend/prisma/migrations/

```



\## ⚙️ Environment Variables



Create a `.env` file inside the backend directory.



Example:



```env

DATABASE\_URL="mysql://USERNAME:PASSWORD@localhost:3306/appzex\_saas"



DB\_HOST=127.0.0.1

DB\_PORT=3306

DB\_USER=YOUR\_DB\_USER

DB\_PASSWORD=YOUR\_DB\_PASSWORD

DB\_NAME=appzex\_saas



JWT\_SECRET=YOUR\_JWT\_SECRET



OPENAI\_API\_KEY=YOUR\_OPENAI\_API\_KEY

```



Do \*\*not\*\* commit the real `.env` file or API keys to GitHub.



The repository contains a `.gitignore` that excludes environment files and generated dependencies.



\## 🛠️ Local Setup



\### 1. Clone the repository



```bash

git clone https://github.com/vicky495/appZex..assesment.git

cd appZex..assesment

```



\### 2. Backend setup



```bash

cd backend

npm install

```



Create the `.env` file with the required database and authentication configuration.



Run Prisma migrations:



```bash

npx prisma migrate deploy

```



Seed the database:



```bash

npm run seed

```



Start the backend:



```bash

npm run dev

```



The backend runs on:



```text

http://localhost:5000

```



\### 3. Frontend setup



Open another terminal:



```bash

cd frontend

npm install

npm run dev

```



The Vite development server normally runs on:



```text

http://localhost:5173

```



\## 👤 Demo Accounts



The seeded application contains demo accounts for different roles.



\### Super Admin



```text

Email: superadmin@appzex.com

Password: Admin@123

Role: SUPER\_ADMIN

```



\### Agency Admin



```text

Email: vickyadmin2026@example.com

Password: Admin@123

Role: AGENCY\_ADMIN

```



\### Client



```text

Email: client1@appzex.com

Password: Client@123

Role: CLIENT

```



> Change demo credentials before using the application in a production environment.



\## 🔑 Role Overview



| Role           | Main Access                                      |

| -------------- | ------------------------------------------------ |

| `SUPER\_ADMIN`  | Platform-level administration                    |

| `AGENCY\_ADMIN` | Agency clients, projects and project management  |

| `AGENCY\_TEAM`  | Agency project/task operations permitted by role |

| `CLIENT`       | Client portal and authorized client resources    |



Authorization is enforced by backend middleware and controller-level tenant checks.



\## 🔌 Main API Areas



The backend exposes protected API modules for:



```text

/api/auth

/api/agencies

/api/clients

/api/client-portal

/api/projects

/api/tasks

/api/files

/api/meetings

/api/feedback

/api/activity

/api/ai

```



Authentication is supplied using a Bearer JWT:



```http

Authorization: Bearer <token>

```



\## 📌 Example Project Workflow



A typical agency workflow is:



```text

Login

&#x20; ↓

Agency Dashboard

&#x20; ↓

Create / Manage Client

&#x20; ↓

Create Project

&#x20; ↓

Open Project Workspace

&#x20; ↓

Create Milestone

&#x20; ↓

Create Task

&#x20; ↓

Set Priority / Due Date / Assignee

&#x20; ↓

Update Task Status

&#x20; ↓

Client views authorized project through Client Portal

```



\## 🔒 Git \& Secrets



The repository intentionally excludes:



```text

.env

node\_modules/

uploads/

dist/

build/

.next/

\*.log

```



Sensitive credentials such as database passwords, JWT secrets and AI API keys should always be provided through environment variables.



\## 🧪 Testing Performed



Functional testing performed during development included:



\* Authentication

\* Agency dashboard loading

\* Client creation/listing

\* Project listing

\* Project details

\* Milestone creation

\* Task creation

\* Task priority

\* Task due date

\* Task assignment

\* Task status updates

\* Client portal access

\* Backend authorization

\* Cross-agency project isolation

\* Cross-client project isolation

\* Client-to-agency API isolation

\* Client-to-file API isolation



\## 📦 Repository



GitHub:



https://github.com/vicky495/appZex..assesment.git



\## 👨‍💻 Author



\*\*Vicky\*\*



Full Stack Developer



Technologies used in the project include React, Vite, Node.js, Express.js, Prisma, MySQL, JWT and JavaScript.



