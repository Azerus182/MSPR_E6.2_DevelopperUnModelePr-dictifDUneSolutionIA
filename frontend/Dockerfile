FROM debian:bookworm

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get upgrade -y && \
apt-get install -y \
curl \
gnupg2 \
lsb-release \
ca-certificates \
openjdk-17-jdk  \
sdkmanager

RUN curl -fsSL https://deb.nodesource.com/setup_24.x | bash - && \
    apt-get install -y nodejs

# android-sdk \

ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64/
ENV PATH=$JAVA_HOME/bin:$PATH

WORKDIR /app

# RUN sdkmanager --update
RUN sdkmanager "build-tools;35.0.0" "platforms;android-36"
RUN yes | sdkmanager --licenses
RUN npm install -g typescript
ENV ANDROID_HOME=/opt/android-sdk/

CMD ["sh", "-c", "npm install; npm run build; npx cap init; npx cap sync android; cd android; ./gradlew assembleRelease --info"]
