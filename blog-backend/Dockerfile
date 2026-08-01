FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline -U
COPY src src
RUN ./mvnw clean package -DskipTests -U
# 检查 postgresql jar 是否在最终 jar 中，若没有则手动下载并注入
RUN jar tf target/*.jar | grep postgresql || \
    (echo "PostgreSQL driver missing, manually adding..." && \
     mkdir -p target/BOOT-INF/lib && \
     cd target/BOOT-INF/lib && \
     wget https://repo1.maven.org/maven2/org/postgresql/postgresql/42.7.3/postgresql-42.7.3.jar && \
     cd /app/target && \
     jar uf blog-backend-0.0.1-SNAPSHOT.jar BOOT-INF/lib/postgresql-42.7.3.jar)

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
