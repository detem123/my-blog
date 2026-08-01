FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
RUN chmod +x mvnw
# 删除本地 postgresql 缓存，强制重新下载
RUN rm -rf /root/.m2/repository/org/postgresql
RUN ./mvnw dependency:go-offline -U
COPY src src
RUN ./mvnw clean package -DskipTests -U
# 验证 postgresql 驱动是否存在
RUN jar tf target/*.jar | grep postgresql || (echo "Postgresql driver missing!" && exit 1)

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
