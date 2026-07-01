import { loadLocalMessages, saveLocalMessages } from '@/utilities/local-db';
import { validateMappings } from '@/utilities/mappings';
import { MessageNode } from 'message-nodes';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

function useMappings(paused: boolean = false): [Record<string, MessageNode<string, Record<string, any>>>, Dispatch<SetStateAction<Record<string, MessageNode<string, Record<string, any>>>>>] {
  const [mappings, setMappings] = useState<Record<string, MessageNode<string>>>({});
  const hydrated = useRef(false);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  // Signature of the id-set we last persisted, used to tell a structural change
  // (node added/removed) from a content-only change (tokens streaming into an
  // existing node).
  const savedIds = useRef<string>("");

  const saveLocalMappings = async () => {
    try {
      await saveLocalMessages(mappings);
    } catch (error) {
      console.error("Error saving mappings:", error);
    }
  };

  useEffect(() => {
    if (!hydrated.current) return;

    const ids = Object.keys(mappings).sort().join("|");
    const structuralChange = ids !== savedIds.current;

    // While a response is streaming, skip per-token content writes. Structural
    // changes (new prompt, deletions) always persist immediately; the final
    // commit after streaming ends persists the complete message. A response
    // killed mid-stream is intentionally not saved, but the prompt that started
    // it is (it was a structural change).
    if (pausedRef.current && !structuralChange) return;

    savedIds.current = ids;
    saveLocalMappings();
  }, [mappings]);

  const loadLocalMappings = async () => {
    try {
      const loaded = await loadLocalMessages();
      if (Object.keys(loaded).length > 0) {
        setMappings(prev => ({ ...prev, ...loaded }));
      }
    } catch (error) {
      console.error("Error loading mappings:", error);
    } finally {
      hydrated.current = true;
    }
  };

  useEffect(() => {
    loadLocalMappings();
  }, []);

  return [mappings, setMappings];
}

export default useMappings;