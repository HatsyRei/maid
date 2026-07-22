#!/usr/bin/env bash
#
# Local Android build helper.
# Regenerates the ignored native project before release builds so app.config.ts
# and plugins/with-maid-android.ts remain the source of truth.
#
# Usage:
#   ./build.sh           # assembleRelease (default)
#   ./build.sh bundle    # bundleRelease (.aab)
#   ./build.sh clean     # remove generated Android/Expo state
#
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"

export JAVA_HOME="${JAVA_HOME:-$HOME/.local/jdks/jdk-21}"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/android-sdk}"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"
export NODE_ENV=production

case "${1:-release}" in
  release) GRADLE_TASK="assembleRelease" ;;
  bundle)  GRADLE_TASK="bundleRelease" ;;
  clean)
    echo "Removing generated Android and Expo state"
    rm -rf "$PROJECT_ROOT/android" "$PROJECT_ROOT/.expo"
    exit 0
    ;;
  *)
    echo "Unknown target '$1' (expected: release | bundle | clean)" >&2
    exit 1
    ;;
esac

echo "Building with JAVA_HOME=$JAVA_HOME"
"$JAVA_HOME/bin/java" -version

cd "$PROJECT_ROOT"
echo "Regenerating Android project"
yarn prebuild

echo "Running gradle task: $GRADLE_TASK"
cd android
./gradlew "$GRADLE_TASK"

if [[ "$GRADLE_TASK" == "assembleRelease" ]]; then
  echo "=== APK outputs ==="
  ls -lh app/build/outputs/apk/release/*.apk
fi
