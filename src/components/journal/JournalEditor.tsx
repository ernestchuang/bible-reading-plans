import { useRef, useEffect, useCallback } from 'react';
import { Crepe, CrepeFeature } from '@milkdown/crepe';
import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame.css';

interface JournalEditorProps {
  onSave: (markdown: string) => void;
  onCancel: () => void;
  linkedTo?: string;
}

export function JournalEditor({ onSave, onCancel, linkedTo }: JournalEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const crepeRef = useRef<Crepe | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const crepe = new Crepe({
      root: containerRef.current,
      defaultValue: '',
      features: {
        [CrepeFeature.CodeMirror]: false,
        [CrepeFeature.Table]: false,
        [CrepeFeature.ImageBlock]: false,
        [CrepeFeature.Latex]: false,
      },
      featureConfigs: {
        [CrepeFeature.Placeholder]: {
          text: 'Write your reflection...',
          mode: 'doc',
        },
      },
    });

    crepeRef.current = crepe;
    crepe.create();

    return () => {
      crepe.destroy();
      crepeRef.current = null;
    };
  }, []);

  const handleSave = useCallback(() => {
    if (!crepeRef.current) return;
    const markdown = crepeRef.current.getMarkdown();
    if (markdown.trim()) {
      onSave(markdown);
    }
  }, [onSave]);

  return (
    <div className="flex flex-col h-full">
      {linkedTo && (
        <div className="px-3 py-1.5 text-xs text-gray-500 bg-amber-50 border-b border-amber-200">
          Replying to entry from{' '}
          <span className="font-medium text-amber-700">
            {linkedTo.replace(/\.md$/, '').replace(/T/, ' ').replace(/-/g, (m, i) => i > 9 ? ':' : m)}
          </span>
        </div>
      )}
      <div ref={containerRef} className="flex-1 min-h-0 overflow-y-auto" />
      <div className="flex justify-end gap-2 px-3 py-2 border-t border-gray-200 bg-white">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Save Entry
        </button>
      </div>
    </div>
  );
}
