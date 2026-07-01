import { loadLocalMessages, saveLocalMessages } from '@/utilities/local-db';
import { validateMappings } from '@/utilities/mappings';
import { MessageNode } from 'message-nodes';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

function useMappings(): [Record<string, MessageNode<string, Record<string, any>>>, Dispatch<SetStateAction<Record<string, MessageNode<string, Record<string, any>>>>>] {
  const [mappings, setMappings] = useState<Record<string, MessageNode<string>>>({});
  const hydrated = useRef(false);

  const saveLocalMappings = async () => {
    try {
      await saveLocalMessages(mappings);
    } catch (error) {
      console.error("Error saving mappings:", error);
    }
  };

  useEffect(() => {
    if (!hydrated.current) return;

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