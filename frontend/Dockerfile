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

ENV ANDROID_HOME=/opt/android-sdk/

RUN ["sh", "-c", "npm run build; npx cap sync android; cd android; ./gradlew assembleRelease --info"]
CMD tail -f /dev/null