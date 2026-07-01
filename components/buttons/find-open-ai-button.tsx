import { useLLM, useSystem } from "@/context";
import * as Network from "expo-network";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

const DEFAULT_PORT = 8080;
const REQUEST_TIMEOUT_MS = 400;
const CONCURRENCY = 64;

function ipToInt(ip: string): number {
  const octets = ip.split(".").map(Number);
  if (octets.length !== 4 || octets.some((value) => Number.isNaN(value) || value < 0 || value > 255)) {
    throw new Error("Invalid IPv4 address");
  }

  return (
    ((octets[0] << 24) >>> 0)
    + ((octets[1] << 16) >>> 0)
    + ((octets[2] << 8) >>> 0)
    + (octets[3] >>> 0)
  ) >>> 0;
}

function intToIp(value: number): string {
  return [
    (value >>> 24) & 255,
    (value >>> 16) & 255,
    (value >>> 8) & 255,
    value & 255,
  ].join(".");
}

function buildSubnetTargets(ip: string, prefixLength: number): Array<string> {
  const ipInt = ipToInt(ip);
  const hostBits = 32 - prefixLength;
  const networkMask = (0xffffffff << hostBits) >>> 0;
  const networkBase = ipInt & networkMask;
  const hostCount = (1 << hostBits) - 2;
  const targets: Array<string> = [];

  for (let offset = 1; offset <= hostCount; offset++) {
    const candidate = intToIp((networkBase + offset) >>> 0);
    if (candidate !== ip) {
      targets.push(candidate);
    }
  }

  return targets;
}

async function probeTarget(target: string): Promise<string> {
  const baseUrl = `http://${target}:${DEFAULT_PORT}`;
  const modelsUrl = `${baseUrl}/v1/models`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(modelsUrl, {
      method: "GET",
      signal: controller.signal,
    });

    // 401/403 can still indicate a valid OpenAI-compatible endpoint.
    if (response.status >= 200 && response.status < 500 && response.status !== 404) {
      return `${baseUrl}/v1`;
    }

    throw new Error("Not OpenAI-compatible");
  } finally {
    clearTimeout(timeoutId);
  }
}

async function scanTargets(targets: Array<string>): Promise<string | undefined> {
  for (let index = 0; index < targets.length; index += CONCURRENCY) {
    const batch = targets.slice(index, index + CONCURRENCY);
    const probes = batch.map((target) => probeTarget(target));

    try {
      return await Promise.any(probes);
    } catch {
      // Nothing found in this batch.
    }
  }

  return undefined;
}

function FindOpenAIButton() {
  const { type, setBaseURL } = useLLM();
  const { colorScheme } = useSystem();

  if (type !== "Open AI" || !setBaseURL) return null;

  const styles = StyleSheet.create({
    button: {
      color: colorScheme.primary,
      backgroundColor: colorScheme.surfaceVariant,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
    }
  });

  const onPress = async () => {
    const ip = await Network.getIpAddressAsync();
    if (!ip) throw new Error("Could not determine local IP");

    let foundBaseUrl = await scanTargets(buildSubnetTargets(ip, 24));

    if (!foundBaseUrl) {
      const subnet21Targets = buildSubnetTargets(ip, 21);
      const subnet24Targets = new Set(buildSubnetTargets(ip, 24));
      const extendedTargets = subnet21Targets.filter((target) => !subnet24Targets.has(target));

      foundBaseUrl = await scanTargets(extendedTargets);
    }

    if (foundBaseUrl) {
      setBaseURL(foundBaseUrl);
    } else {
      alert("Could not find an OpenAI-compatible endpoint on the local network.");
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
    >
      <Text style={styles.button}>
        Find OpenAI Endpoint
      </Text>
    </TouchableOpacity>
  );
}

export default FindOpenAIButton;
