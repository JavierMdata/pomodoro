import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Mathematics from '@tiptap/extension-mathematics';
import {
  Bold, Italic, List, ListOrdered, CheckSquare,
  Code, Quote, Image as ImageIcon, Link as LinkIcon,
  Heading1, Heading2, Heading3, Sparkles, Save, BookOpen,
  ChevronDown, Hash, PlusCircle, X
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { ContentBlock, EntityType } from '../types';

interface BlockEditorProps {
  blockId?: string;
  entityType?: EntityType;
  entityId?: string;
  onSave?: (block: ContentBlock) => void;
  placeholder?: string;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  blockId,
  entityType,
  entityId,
  onSave,
  placeholder = 'Escribe algo increíble... Usa # para hashtags y @ para menciones'
}) => {
  const activeProfileId = useAppStore(state => state.activeProfileId);
  const contentBlocks = useAppStore(state => state.contentBlocks);
  const subjects = useAppStore(state => state.subjects);
  const addContentBlock = useAppStore(state => state.addContentBlock);
  const updateContentBlock = useAppStore(state => state.updateContentBlock);
  const parseWikiLinks = useAppStore(state => state.parseWikiLinks);
  const createNoteLink = useAppStore(state => state.createNoteLink);
  const analyzeAndCreateLinks = useAppStore(state => state.analyzeAndCreateLinks);

  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | undefined>(entityId);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [detectedHashtags, setDetectedHashtags] = useState<string[]>([]);
  const [isImageUploading, setIsImageUploading] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cargar bloque existente si se proporciona blockId
  useEffect(() => {
    if (blockId) {
      const block = contentBlocks.find(b => b.id === blockId);
      if (block) {
        setTitle(block.title || '');
        setSelectedSubjectId(block.subject_id);
        if (editor && block.content?.text) {
          editor.commands.setContent(block.content.text);
        }
      }
    }
  }, [blockId, contentBlocks]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSubjectDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] }
      }),
      Placeholder.configure({ placeholder }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-4 shadow-lg'
        }
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-purple-400 hover:text-purple-300 underline decoration-purple-500/50 decoration-2 hover:decoration-purple-400 cursor-pointer transition-all'
        }
      }),
      Mathematics.configure({
        HTMLAttributes: {
          class: 'math-formula bg-purple-900/30 px-2 py-1 rounded border border-purple-500/30'
        },
        katexOptions: {
          throwOnError: false
        }
      })
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-sm md:prose lg:prose-lg focus:outline-none min-h-[250px] md:min-h-[300px] lg:min-h-[350px] max-w-none prose-headings:text-purple-100 prose-p:text-gray-300 prose-strong:text-purple-200 prose-code:text-pink-300 prose-code:bg-gray-800/50 prose-code:px-1 prose-code:rounded'
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            handleImageUpload(file);
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event, slice) => {
        const items = Array.from(event.clipboardData?.items || []);
        for (const item of items) {
          if (item.type.indexOf('image') === 0) {
            const file = item.getAsFile();
            if (file) {
              handleImageUpload(file);
              return true;
            }
          }
        }
        return false;
      }
    },
    onUpdate: ({ editor }) => {
      // Detectar hashtags
      const text = editor.getText();
      const hashtagRegex = /#(\w+)/g;
      const foundHashtags = [...text.matchAll(hashtagRegex)].map(m => m[1]);
      setDetectedHashtags([...new Set(foundHashtags)]);

      // Auto-guardar cada 3 segundos de inactividad
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        handleAutoSave();
      }, 3000);
    }
  });

  let autoSaveTimer: NodeJS.Timeout | null = null;

  const handleImageUpload = async (file: File) => {
    setIsImageUploading(true);
    try {
      // Convertir a base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        if (editor) {
          editor.chain().focus().setImage({ src: base64 }).run();
        }
        setIsImageUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error al subir imagen:', error);
      setIsImageUploading(false);
    }
  };

  const handleAutoSave = async () => {
    if (!editor || !activeProfileId) return;

    const htmlContent = editor.getHTML();
    const plainText = editor.getText();

    const content = {
      text: htmlContent,
      plainText: plainText,
      format: {
        bold: editor.isActive('bold'),
        italic: editor.isActive('italic')
      }
    };

    // Detectar hashtags y wiki links
    const wikiLinks = parseWikiLinks(plainText);
    const hashtagRegex = /#(\w+)/g;
    const hashtags = [...plainText.matchAll(hashtagRegex)].map(m => m[1]);

    try {
      setIsSaving(true);

      if (blockId) {
        // Actualizar bloque existente
        await updateContentBlock(blockId, {
          title,
          content,
          subject_id: selectedSubjectId,
          updated_at: new Date().toISOString()
        });

        // Analizar y crear enlaces automáticos
        if (analyzeAndCreateLinks) {
          await analyzeAndCreateLinks(blockId, 'content_block', title, plainText, hashtags);
        }
      } else {
        // Crear nuevo bloque
        const newBlockData: Omit<ContentBlock, 'id' | 'created_at' | 'updated_at'> = {
          profile_id: activeProfileId,
          block_type: 'text',
          position: 0,
          title,
          content,
          subject_id: selectedSubjectId
        };

        const newBlock = await addContentBlock(newBlockData);

        // Crear enlaces después de crear el bloque
        if (newBlock && analyzeAndCreateLinks) {
          await analyzeAndCreateLinks(newBlock.id, 'content_block', title, plainText, hashtags);
        }
      }

      setLastSaved(new Date());
      console.log('💾 Auto-guardado completado');

      if (wikiLinks.length > 0) {
        console.log('🔗 Enlaces detectados:', wikiLinks);
      }

      if (hashtags.length > 0) {
        console.log('🏷️ Hashtags detectados:', hashtags);
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

  const insertFormula = () => {
    if (editor) {
      const formula = window.prompt('Ingresa la fórmula LaTeX (ej: E = mc^2):');
      if (formula) {
        editor.chain().focus().insertContent(`$${formula}$`).run();
      }
    }
  };

  const activeSubjects = subjects.filter(s => s.profile_id === activeProfileId);
  const selectedSubject = activeSubjects.find(s => s.id === selectedSubjectId);

  if (!editor) {
    return (
      <div className="animate-pulse bg-gray-800/50 h-64 rounded-2xl border border-purple-500/20"></div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto bg-gray-900 rounded-xl md:rounded-2xl lg:rounded-3xl shadow-2xl border border-purple-500/30 overflow-hidden transition-all duration-300 hover:shadow-purple-500/20 hover:shadow-2xl">
      {/* Header con título y asociación de materia */}
      <div className="p-4 md:p-5 lg:p-6 border-b border-purple-500/20 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="✨ Título de la nota..."
          className="w-full text-xl md:text-2xl lg:text-3xl font-bold bg-transparent border-none outline-none placeholder-gray-600 text-purple-100 mb-3 md:mb-4"
          onBlur={handleAutoSave}
        />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          {/* Asociación de Materia */}
          <div className="relative w-full sm:w-auto" ref={dropdownRef}>
            <button
              onClick={() => setShowSubjectDropdown(!showSubjectDropdown)}
              className={`
                w-full sm:w-auto flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg md:rounded-xl font-medium transition-all text-sm md:text-base
                ${selectedSubject
                  ? 'bg-purple-600/20 border-2 border-purple-500/50 text-purple-300 hover:bg-purple-600/30'
                  : 'bg-gray-800/50 border-2 border-gray-700 text-gray-400 hover:bg-gray-800 hover:border-purple-500/30'
                }
              `}
            >
              <BookOpen className="w-4 h-4 flex-shrink-0" />
              {selectedSubject ? (
                <>
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: selectedSubject.color }}></span>
                  <span className="truncate">{selectedSubject.name}</span>
                </>
              ) : (
                <span className="truncate">Vincular a Materia</span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${showSubjectDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown de Materias */}
            {showSubjectDropdown && (
              <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-2 w-full sm:w-64 md:w-72 bg-gray-800 border border-purple-500/30 rounded-lg md:rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="p-2 border-b border-purple-500/20 bg-purple-900/20">
                  <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Selecciona una Materia</span>
                </div>
                <div className="max-h-48 md:max-h-64 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedSubjectId(undefined);
                      setShowSubjectDropdown(false);
                    }}
                    className="w-full px-3 md:px-4 py-2 text-left text-sm md:text-base text-gray-400 hover:bg-gray-700/50 transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Sin materia</span>
                  </button>
                  {activeSubjects.map((subject) => (
                    <button
                      key={subject.id}
                      onClick={() => {
                        setSelectedSubjectId(subject.id);
                        setShowSubjectDropdown(false);
                      }}
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 text-left hover:bg-purple-900/30 transition-colors flex items-center gap-2 md:gap-3 border-l-2 border-transparent hover:border-purple-500"
                    >
                      <span
                        className="w-3 h-3 md:w-4 md:h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: subject.color }}
                      ></span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm md:text-base text-purple-100 truncate">{subject.name}</div>
                        {subject.code && (
                          <div className="text-xs text-gray-500 truncate">{subject.code}</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Estado de guardado */}
          <div className="flex flex-wrap items-center gap-2 md:gap-3 lg:gap-4">
            {detectedHashtags.length > 0 && (
              <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 bg-pink-900/30 rounded-lg border border-pink-500/30">
                <Hash className="w-3 h-3 md:w-4 md:h-4 text-pink-400 flex-shrink-0" />
                <span className="text-xs text-pink-300 whitespace-nowrap">{detectedHashtags.length} hashtag{detectedHashtags.length !== 1 ? 's' : ''}</span>
              </div>
            )}

            {isImageUploading && (
              <span className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-blue-400">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                <span className="hidden sm:inline">Subiendo imagen...</span>
              </span>
            )}

            {isSaving && (
              <span className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-purple-400">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse flex-shrink-0"></div>
                <span className="hidden sm:inline">Guardando...</span>
              </span>
            )}

            {lastSaved && !isSaving && (
              <span className="text-xs md:text-sm text-green-400 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></span>
                <span className="hidden sm:inline">Guardado {lastSaved.toLocaleTimeString()}</span>
              </span>
            )}

            <button
              onClick={handleManualSave}
              className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg md:rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg hover:shadow-purple-500/50 text-sm md:text-base"
            >
              <Save className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Guardar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Barra de herramientas mejorada */}
      <div className="flex items-center gap-0.5 md:gap-1 p-2 md:p-3 bg-gray-800/50 border-b border-purple-500/20 overflow-x-auto scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-gray-800">
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

        <div className="w-px h-6 bg-purple-500/30 mx-1"></div>

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

        <div className="w-px h-6 bg-purple-500/30 mx-1"></div>

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

        <div className="w-px h-6 bg-purple-500/30 mx-1"></div>

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

        <div className="w-px h-6 bg-purple-500/30 mx-1"></div>

        <ToolbarButton
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) handleImageUpload(file);
            };
            input.click();
          }}
          icon={<ImageIcon className="w-4 h-4" />}
          tooltip="Insertar imagen (o arrástrala)"
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

        <ToolbarButton
          onClick={insertFormula}
          active={editor.isActive('mathematics')}
          icon={<span className="text-xs font-bold">ƒ(x)</span>}
          tooltip="Insertar fórmula matemática"
        />
      </div>

      {/* Editor de contenido */}
      <div className="p-4 md:p-5 lg:p-6 min-h-[300px] md:min-h-[350px] lg:min-h-[400px] bg-gray-900">
        <EditorContent editor={editor} />
      </div>

      {/* Footer con hashtags detectados */}
      {detectedHashtags.length > 0 && (
        <div className="p-3 md:p-4 bg-gradient-to-r from-pink-900/20 to-purple-900/20 border-t border-purple-500/20">
          <div className="flex items-center gap-2 flex-wrap">
            <Hash className="w-3.5 h-3.5 md:w-4 md:h-4 text-pink-400 flex-shrink-0" />
            <span className="text-xs font-bold text-pink-300 uppercase">Hashtags:</span>
            {detectedHashtags.map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 md:py-1 bg-pink-600/20 text-pink-300 rounded-md md:rounded-lg text-xs border border-pink-500/30 hover:bg-pink-600/30 transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
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
        p-1.5 md:p-2 rounded-md md:rounded-lg transition-all duration-200
        ${active
          ? 'bg-purple-600/30 text-purple-300 ring-1 md:ring-2 ring-purple-500/50'
          : 'hover:bg-gray-700/50 text-gray-400 hover:text-purple-300'
        }
      `}
    >
      {icon}
    </button>
  );
};

export default BlockEditor;
