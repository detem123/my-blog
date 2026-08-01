FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline
COPY src ./src
RUN ./mvnw clean package -DskipTests
EXPOSE 8080
# 指定确切的 jar 文件名
CMD ["java", "-jar", "target/blog-backend-0.0.1-SNAPSHOT.jar"]
