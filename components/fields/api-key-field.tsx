import TextField from "@/components/fields/text-field";
import { useLLM } from "@/context";

function ApiKeyField() {
  const { apiKey, setApiKey } = useLLM();

  if (!setApiKey) {
    return null;
  }

  return (
    <TextField
      label="API Key"
      value={apiKey}
      onChangeText={setApiKey}
    />
  );
}

export default ApiKeyField;