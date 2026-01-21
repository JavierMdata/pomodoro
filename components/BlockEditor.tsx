import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import {
  Bold, Italic, List, ListOrdered, CheckSquare,
  Code, Quote, Image as ImageIcon, Link as LinkIcon,
  Heading1, Heading2, Heading3, Sparkles, Save
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { ContentBlock, EntityType } from '../types';

interface BlockEditorProps {
  blockId?: string; // Si se proporciona, editar bloque existente
  entityType?: EntityType; // Si se proporciona, vincular a entidad
  entityId?: string;
  onSave?: (block: ContentBlock) => void;
  placeholder?: string;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  blockId,
  entityType,
  entityId,
  onSave,
  placeholder = 'Escribe algo increíble... o presiona / para comandos'
}) => {
  const activeProfileId = useAppStore(state => state.activeProfileId);
  const contentBlocks = useAppStore(state => state.contentBlocks);
  const addContentBlock = useAppStore(state => state.addContentBlock);
  const updateContentBlock = useAppStore(state => state.updateContentBlock);
  const parseWikiLinks = useAppStore(state => state.parseWikiLinks);

  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Cargar bloque existente si se proporciona blockId
  useEffect(() => {
    if (blockId) {
      const block = contentBlocks.find(b => b.id === blockId);
      if (block) {
        setTitle(block.title || '');
        if (editor && block.content?.text) {
          editor.commands.setContent(block.content.text);
        }
      }
    }
  }, [blockId, contentBlocks]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Placeholder.configure({
        placeholder
      }),
      TaskList,
      TaskItem.configure({
        nested: true
      }),
      Image.configure({
        inline: true,
        allowBase64: true
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 hover:text-blue-600 underline cursor-pointer'
        }
      })
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[200px] max-w-none'
      }
    },
    onUpdate: ({ editor }) => {
      // Auto-guardar cada 3 segundos de inactividad
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        handleAutoSave();
      }, 3000);
    }
  });

  let autoSaveTimer: NodeJS.Timeout | null = null;

  const handleAutoSave = async () => {
    if (!editor || !activeProfileId) return;

    const content = {
      text: editor.getHTML(),
      format: {
        bold: editor.isActive('bold'),
        italic: editor.isActive('italic')
      }
    };

    // Detectar wiki links [[]]
    const plainText = editor.getText();
    const wikiLinks = parseWikiLinks(plainText);

    try {
      setIsSaving(true);

      if (blockId) {
        // Actualizar bloque existente
        await updateContentBlock(blockId, {
          title,
          content,
          updated_at: new Date().toISOString()
        });
      } else {
        // Crear nuevo bloque
        const newBlockData: Omit<ContentBlock, 'id' | 'created_at' | 'updated_at'> = {
          profile_id: activeProfileId,
          block_type: 'text',
          position: 0,
          title,
          content,
          ...(entityType && { [`${entityType}_id`]: entityId })
        };

        await addContentBlock(newBlockData);
      }

      setLastSaved(new Date());
      console.log('💾 Auto-guardado completado');

      if (wikiLinks.length > 0) {
        console.log('🔗 Enlaces detectados:', wikiLinks);
        // TODO: Crear enlaces automáticamente
      }
    } catch (error) {
      console.error('Error al auto-guardar:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualSave = async () => {
    await handleAutoSave();

    if (onSave && blockId) {
      const block = contentBlocks.find(b => b.id === blockId);
      if (block) onSave(block);
    }
  };

  if (!editor) {
    return <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-md">
      {/* Header con título */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título de la nota..."
          className="w-full text-3xl font-bold bg-transparent border-none outline-none placeholder-gray-400 dark:placeholder-gray-600 text-gray-900 dark:text-gray-100"
          onBlur={handleAutoSave}
        />

        <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            {isSaving && (
              <span className="flex items-center gap-1 text-blue-500">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                Guardando...
              </span>
            )}
            {lastSaved && !isSaving && (
              <span className="text-green-600">
                ✓ Guardado {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>

          <button
            onClick={handleManualSave}
            className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Save className="w-4 h-4" />
            Guardar
          </button>
        </div>
      </div>

      {/* Barra de herramientas */}
      <div className="flex items-center gap-1 p-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          icon={<Bold className="w-4 h-4" />}
          tooltip="Negrita"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          icon={<Italic className="w-4 h-4" />}
          tooltip="Cursiva"
        />

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1"></div>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          icon={<Heading1 className="w-4 h-4" />}
          tooltip="Encabezado 1"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          icon={<Heading2 className="w-4 h-4" />}
          tooltip="Encabezado 2"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          icon={<Heading3 className="w-4 h-4" />}
          tooltip="Encabezado 3"
        />

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1"></div>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          icon={<List className="w-4 h-4" />}
          tooltip="Lista de viñetas"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          icon={<ListOrdered className="w-4 h-4" />}
          tooltip="Lista numerada"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          active={editor.isActive('taskList')}
          icon={<CheckSquare className="w-4 h-4" />}
          tooltip="Lista de tareas"
        />

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1"></div>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          icon={<Code className="w-4 h-4" />}
          tooltip="Código"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          icon={<Quote className="w-4 h-4" />}
          tooltip="Cita"
        />

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1"></div>

        <ToolbarButton
          onClick={() => {
            const url = window.prompt('URL de la imagen:');
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          }}
          icon={<ImageIcon className="w-4 h-4" />}
          tooltip="Insertar imagen"
        />

        <ToolbarButton
          onClick={() => {
            const url = window.prompt('URL del enlace:');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          active={editor.isActive('link')}
          icon={<LinkIcon className="w-4 h-4" />}
          tooltip="Insertar enlace"
        />
      </div>

      {/* Editor de contenido */}
      <div className="p-6 min-h-[300px] bg-white dark:bg-gray-800">
        <EditorContent editor={editor} />
      </div>

      {/* Footer con ayudas */}
      <div className="p-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Tip: Usa <code className="px-1 bg-gray-200 dark:bg-gray-700 rounded">[[nombre]]</code> para crear enlaces a otras notas
          </span>
        </div>
      </div>
    </div>
  );
};

// Componente auxiliar para botones de toolbar
interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  icon: React.ReactNode;
  tooltip: string;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  onClick,
  active = false,
  icon,
  tooltip
}) => {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={`
        p-2 rounded-lg transition-all duration-200
        ${active
          ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
          : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
        }
      `}
    >
      {icon}
    </button>
  );
};

export default BlockEditor;
