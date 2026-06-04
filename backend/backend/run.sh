#!/usr/bin/env bash
# macOS: Homebrew OpenJDK 17 (JAVA_HOME olmadan mvnw calismaz)
set -e
cd "$(dirname "$0")"

if [ -d "/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home" ]; then
  export JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
elif [ -d "/opt/homebrew/opt/openjdk@17" ]; then
  export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
else
  echo "JDK 17 bulunamadi. Kurun: brew install openjdk@17"
  exit 1
fi

export PATH="$JAVA_HOME/bin:$PATH"

if [ ! -x "$JAVA_HOME/bin/javac" ]; then
  echo "Hata: javac bulunamadi (JRE degil, tam JDK gerekir)."
  echo "Deneyin: export JAVA_HOME=\"/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home\""
  exit 1
fi

if [ -z "$GROQ_API_KEY" ]; then
  echo "Uyari: GROQ_API_KEY tanimli degil (chatbot/oneri icin gerekli)."
fi

chmod +x ./mvnw 2>/dev/null || true
./mvnw spring-boot:run "$@"
