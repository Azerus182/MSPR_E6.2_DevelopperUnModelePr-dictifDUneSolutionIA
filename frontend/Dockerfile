FROM debian:latest

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y \
    curl \
    gnupg2 \
    lsb-release \
    ca-certificates \
    openjdk-25-jdk

ENV JAVA_HOME=/usr/lib/jvm/java-25-openjdk-amd64/
ENV PATH=$JAVA_HOME/bin:$PATH

RUN curl -fsSL https://deb.nodesource.com/setup_24.x | bash - && \
    apt-get install -y nodejs

RUN java -version && node -v

WORKDIR /app

CMD ["sh", "-c", "npm run build; npx cap copy android; cd android; ./gradlew assembleRelease"]