import { useState, useRef, useEffect, useCallback } from 'react';
import { Crepe, CrepeFeature } from '@milkdown/crepe';
import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame.css';

interface JournalEditorProps {
  onSave: (markdown: string) => void;
  onCancel: () => void;
  linkedTo?: string;
}

const CHEAT_SHEET = [
  { syntax: '# Heading', desc: 'Large heading' },
  { syntax: '## Heading', desc: 'Medium heading' },
  { syntax: '### Heading', desc: 'Small heading' },
  { syntax: '**bold**', desc: 'Bold text' },
  { syntax: '*italic*', desc: 'Italic text' },
  { syntax: '~~strikethrough~~', desc: 'Strikethrough' },
  { syntax: '- item', desc: 'Bullet list' },
  { syntax: '1. item', desc: 'Numbered list' },
  { syntax: '- [ ] task', desc: 'Task list' },
  { syntax: '> quote', desc: 'Block quote' },
  { syntax: '[text](url)', desc: 'Link' },
  { syntax: '---', desc: 'Horizontal rule' },
];

export function JournalEditor({ onSave, onCancel, linkedTo }: JournalEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const crepeRef = useRef<Crepe | null>(null);
  const [showHelp, setShowHelp] = useState(false);

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
    <div className="flex flex-col h-full relative">
      {linkedTo && (
        <div className="px-3 py-1.5 text-xs text-gray-500 bg-amber-50 border-b border-amber-200">
          Replying to entry from{' '}
          <span className="font-medium text-amber-700">
            {linkedTo.replace(/\.md$/, '').replace(/T/, ' ').replace(/-/g, (m, i) => i > 9 ? ':' : m)}
          </span>
        </div>
      )}
      <div ref={containerRef} className="flex-1 min-h-0 overflow-y-auto" />

      {showHelp && (
        <div className="absolute bottom-12 left-3 right-3 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-700">Formatting Guide</span>
            <button
              onClick={() => setShowHelp(false)}
              className="text-gray-400 hover:text-gray-600 text-sm leading-none"
            >
              &times;
            </button>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {CHEAT_SHEET.map(({ syntax, desc }) => (
              <div key={syntax} className="flex items-baseline gap-2 text-xs">
                <code className="font-mono text-indigo-600 bg-gray-50 px-1 rounded whitespace-nowrap">
                  {syntax}
                </code>
                <span className="text-gray-500">{desc}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Type the syntax then press Space to format. You can also select text and use the floating toolbar.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200 bg-white">
        <button
          onClick={() => setShowHelp((p) => !p)}
          className="px-2 py-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
          title="Formatting help"
        >
          ? Formatting
        </button>
        <div className="flex gap-2">
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
    </div>
  );
}
