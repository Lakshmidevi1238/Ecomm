# ---------- Build Stage ----------
FROM maven:3.9.5-eclipse-temurin-17 AS build
WORKDIR /app

# Copy the build configuration and source code
COPY pom.xml .
COPY src ./src

# Build the application
RUN mvn -B -DskipTests package

# ---------- Run Stage ----------
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the built JAR file from the build stage to the final image
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]