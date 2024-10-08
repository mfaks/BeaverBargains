<div align="center">
  <h1 align="center">BeaverBargains</h1>
  <img width="746" height="auto" alt="home" src="https://github.com/user-attachments/assets/f4177c87-a9fa-423b-9a10-fe05aa7f2488">
</div>

## Introduction 🚀

BeaverBargains was created to provide the Oregon State community with a secure platform to buy, sell, and trade items. It addresses concerns about unverified users by requiring email authentication with a .oregonstate.edu email to access the platform. This ensures that only authorized OSU community members can participate. The platform also supports users who are moving out by providing a space to give away or sell used items throughout the year, aiming to enhance community interactions and facilitate transactions within the Oregon State community.

If you do not have a .oregonstate.edu email but wish to access the platform, please contact support at [beaverbargains2024@outlook.com](mailto:beaverbargains2024@outlook.com) to request an override.

Try it out for free here: https://beaver-bargains.vercel.app/

## Features ✨

- **User Authentication:** Only authorized Oregon State community members with a .oregonstate.edu email can create an account. Email verification is required (check spam for an email from beaverbargains2024@outlook.com).
- **Product Listings:** Users can list products for sale on the marketplace and purchase items listed by others.
- **Messaging System:** Communicate directly with buyers/sellers via in-app messaging. Users receive notifications for new messages.
- **Wishlist:** Users can favorite items and track their favorites on a dedicated favorties page.
- **Order Tracking:** Track the status of purchased items as well as their order history.

## Tech Stack 🛠️

### Frontend

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![ShadCN](https://img.shields.io/badge/ShadCN-FFA500?style=for-the-badge&logo=ShadCN&logoColor=white)](https://shadcn.dev/)

### Backend

[![Java](https://img.shields.io/badge/Java-007396?style=for-the-badge&logo=java&logoColor=white)](https://www.java.com/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)

### Deployment

[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)

## Contributing 🤝

Since this application was designed to benefit the Oregon State community, users looking to contribute to app improvements are more than welcome! When contributing, please follow these steps.

### Prerequisites
- Docker Desktop installed on your local machine

### Setup Instructions
1. Fork the repository.
2. Clone your fork of the `dev` branch:
```
   git clone -b dev https://github.com/YOUR_USERNAME/beaver-bargains.git
```
```
   cd beaver-bargains
```
3. Create a .env file in the root directory with the following content:

```
DB_URL=      
DB_USERNAME=        
DB_PASSWORD=        
POSTGRES_DB=        
EMAIL_PASSWORD=      
NEXT_PUBLIC_API_URL=      
JWT_SECRET_KEY=      
REDIS_HOST=        
REDIS_PORT=
```
4. Run the application locally using Docker Compose:
```
docker-compose up
```

5. Once the application is running, you can view it by opening your browser and navigating to:
```
http://localhost:3000
```

### Making Changes

1. Create a new branch for your feature:
```
git checkout -b feature/your-feature-name
```

3. Make your changes and commit them:        
```
git commit -m 'Add some feature'
```

4. Push to your fork:        
```
git push origin feature/your-feature-name
```

5. Open a pull request to the dev branch of the main repository.

### Review Process

The Beaver Bargains team will review your changes. If approved, your changes will be merged into the dev branch.

## What's Next? 🚀

- **In-App Payments:** Integrate the Stripe API to enable secure in-app payments directly through the platform.
- **Mobile App:** Develop a mobile version of BeaverBargains to increase accessibility and convenience for users on the go.
- **Community Engagement:** Implement features to enhance community engagement, such as event listings and user forums.

## License 📜

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.

## Contact 📧

Muhammad Faks (Author) - [muhammad.faks@gmail.com](mailto:muhammad.faks@gmail.com)        
BeaverBargains Support  - [beaverbargains2024@outlook.com](mailto:beaverbargains2024@outlook.com)
