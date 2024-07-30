FROM maven:3.9.8-eclipse-temurin-22 AS build
WORKDIR /app
COPY pom.xml .
COPY /src ./src
RUN mvn clean package -DskipTests
FROM eclipse-temurin:22-jdk-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
RUN mkdir -p /app/uploads && chmod 777 /app/uploads
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]