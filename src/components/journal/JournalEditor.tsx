import { useState, useRef, useEffect, useCallback } from 'react';
import { Crepe, CrepeFeature } from '@milkdown/crepe';
import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame.css';
import type { FontFamily, FontSize } from '../../types';
import { getFontCss } from '../../data/fonts';
import { TagInput } from './TagInput';

interface JournalEditorProps {
  onSave: (markdown: string, tags: string[]) => void;
  onCancel: () => void;
  replyTo?: string;
  fontFamily: FontFamily;
  fontSize: FontSize;
  availableTags: string[];
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

export function JournalEditor({ onSave, onCancel, replyTo, fontFamily, fontSize, availableTags }: JournalEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const crepeRef = useRef<Crepe | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [tags, setTags] = useState<string[]>([]);

  const fontCss = getFontCss(fontFamily);

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
      onSave(markdown, tags);
    }
  }, [onSave, tags]);

  return (
    <div className="flex flex-col h-full relative">
      {replyTo && (
        <div className="px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 bg-amber-50 dark:bg-amber-950 border-b border-amber-200 dark:border-amber-800">
          Replying to entry from{' '}
          <span className="font-medium text-amber-700 dark:text-amber-400">
            {replyTo.replace(/\.md$/, '').replace(/T/, ' ').replace(/-/g, (m, i) => i > 9 ? ':' : m)}
          </span>
        </div>
      )}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 overflow-y-auto"
        style={{
          fontFamily: fontCss,
          fontSize: `${fontSize}px`,
          lineHeight: `${fontSize + 8}px`,
        }}
      />

      {showHelp && (
        <div className="absolute bottom-12 left-3 right-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Formatting Guide</span>
            <button
              onClick={() => setShowHelp(false)}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 text-sm leading-none"
            >
              &times;
            </button>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {CHEAT_SHEET.map(({ syntax, desc }) => (
              <div key={syntax} className="flex items-baseline gap-2 text-xs">
                <code className="font-mono text-indigo-600 dark:text-indigo-400 bg-gray-50 dark:bg-gray-700 px-1 rounded whitespace-nowrap">
                  {syntax}
                </code>
                <span className="text-gray-500 dark:text-gray-400">{desc}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Type the syntax then press Space to format. You can also select text and use the floating toolbar.
          </p>
        </div>
      )}

      <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <TagInput tags={tags} onChange={setTags} availableTags={availableTags} />
      </div>

      <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <button
          onClick={() => setShowHelp((p) => !p)}
          className="px-2 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          title="Formatting help"
        >
          ? Formatting
        </button>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
          >
            Save Entry
          </button>
        </div>
      </div>
    </div>
  );
}
