import { MessageNode, updateContent } from "message-nodes";

type Mappings = Record<string, MessageNode<string>>;
type SetMappings = (updater: (prev: Mappings) => Mappings) => void;

/**
 * Throttles streaming content updates so React state is committed at most once
 * per interval, with a guaranteed trailing flush. Keeps streaming smooth while
 * cutting re-renders and debounced disk writes during fast token bursts.
 */
export function createStreamWriter(setMappings: SetMappings, responseId: string, intervalMs = 80) {
  let buffer = "";
  let last = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const commit = () => {
    setMappings((prev) => updateContent(prev, responseId, buffer));
  };

  return {
    push(chunk: string) {
      buffer += chunk;
      const now = Date.now();
      if (now - last >= intervalMs) {
        last = now;
        commit();
      } else if (!timer) {
        timer = setTimeout(() => {
          timer = null;
          last = Date.now();
          commit();
        }, intervalMs);
      }
    },
    flush() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      commit();
    },
  };
}
