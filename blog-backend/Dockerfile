FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
RUN chmod +x mvnw
# 强制更新依赖并下载 PostgreSQL 驱动
RUN ./mvnw dependency:resolve -U
RUN ./mvnw dependency:go-offline -U
COPY src src
RUN ./mvnw clean package -DskipTests -U
# 如果驱动还是没有，手动添加
RUN ls -la \ || echo "No PostgreSQL jar found in local cache"

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
