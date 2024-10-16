import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Palette, X, Heart, Smile } from 'lucide-react';

interface Nota {
  id: number;
  contenido: string;
  x: number;
  y: number;
  color: string;
  likes: number;
  emoji: string;
}

interface NotaAdhesivaProps {
  nota: Nota;
  actualizarNota: (id: number, nuevoContenido: string) => void;
  moverNota: (id: number, x: number, y: number) => void;
  cambiarColorNota: (id: number) => void;
  eliminarNota: (id: number) => void;
  likeNota: (id: number) => void;
  setEmojiNota: (id: number, emoji: string) => void;
  nombreUsuario: string;
  zoom: number;
}

const emojis = ['😊', '👍', '🎉', '💡', '❤️', '🚀', '🌟', '🔥'];

const NotaAdhesiva: React.FC<NotaAdhesivaProps> = ({
  nota,
  actualizarNota,
  moverNota,
  cambiarColorNota,
  eliminarNota,
  likeNota,
  setEmojiNota,
  nombreUsuario,
  zoom
}) => {
  const [editando, setEditando] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const notaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  const iniciarArrastre = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (editando) return;
    e.preventDefault();
    e.stopPropagation();
    if (notaRef.current) {
      const rect = notaRef.current.getBoundingClientRect();
      offsetRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      document.addEventListener('mousemove', moverNotaHandler);
      document.addEventListener('mouseup', soltarNotaHandler);
    }
  }, [editando]);

  const moverNotaHandler = useCallback((e: MouseEvent) => {
    if (notaRef.current && notaRef.current.parentElement) {
      const parentRect = notaRef.current.parentElement.getBoundingClientRect();
      const newX = (e.clientX - parentRect.left - offsetRef.current.x) / zoom;
      const newY = (e.clientY - parentRect.top - offsetRef.current.y) / zoom;
      notaRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
    }
  }, [zoom]);

  const soltarNotaHandler = useCallback(() => {
    document.removeEventListener('mousemove', moverNotaHandler);
    document.removeEventListener('mouseup', soltarNotaHandler);
    if (notaRef.current) {
      const style = window.getComputedStyle(notaRef.current);
      const matrix = new DOMMatrix(style.transform);
      moverNota(nota.id, matrix.m41, matrix.m42);
    }
  }, [moverNota, nota.id]);

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', moverNotaHandler);
      document.removeEventListener('mouseup', soltarNotaHandler);
    };
  }, [moverNotaHandler, soltarNotaHandler]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!editando) {
      setEditando(true);
    }
  };

  const handleBlur = () => {
    setEditando(false);
  };

  const handleCambiarColor = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    cambiarColorNota(nota.id);
  };

  const handleEliminar = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    setTimeout(() => {
      eliminarNota(nota.id);
    }, 300);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiking(true);
    likeNota(nota.id);
    setTimeout(() => setIsLiking(false), 1000);
  };

  const handleEmojiClick = (emoji: string) => {
    setEmojiNota(nota.id, emoji);
    setShowEmojiPicker(false);
  };

  useEffect(() => {
    if (editando && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [editando]);

  return (
    <div
      ref={notaRef}
      className={`absolute w-48 h-48 p-4 shadow-lg rounded-lg cursor-move overflow-hidden transition-all duration-300 ease-in-out
                  ${isDeleting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
                  hover:scale-105 hover:shadow-xl`}
      style={{
        backgroundColor: nota.color,
        transform: `translate(${nota.x}px, ${nota.y}px)`,
        transition: isDeleting ? 'all 0.3s ease-in-out' : 'none',
      }}
      onMouseDown={iniciarArrastre}
      onClick={handleClick}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      <div className="absolute top-2 left-2 flex space-x-2">
        <button
          className="p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors duration-200 hover:shadow-lg"
          onClick={handleCambiarColor}
        >
          <Palette size={16} />
        </button>
        <button
          className="p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors duration-200 hover:shadow-lg"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <Smile size={16} />
        </button>
        <button
          className="p-1 bg-white rounded-full shadow-md hover:bg-red-100 transition-colors duration-200 hover:shadow-lg"
          onClick={handleEliminar}
        >
          <X size={16} />
        </button>
      </div>
      {showEmojiPicker && (
        <div className="absolute top-10 left-2 z-10 bg-white rounded-lg shadow-lg p-2 flex flex-wrap gap-1">
          {emojis.map((emoji) => (
            <button
              key={emoji}
              className="text-xl hover:bg-gray-100 rounded p-1 transition-colors duration-200"
              onClick={() => handleEmojiClick(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
      {nota.emoji && (
        <div className="absolute top-2 right-2 text-4xl opacity-20 pointer-events-none">
          {nota.emoji}
        </div>
      )}
      <textarea
        ref={textareaRef}
        className="w-full h-full bg-transparent resize-none outline-none mt-10"
        value={nota.contenido}
        onChange={(e) => actualizarNota(nota.id, e.target.value)}
        onBlur={handleBlur}
        readOnly={!editando}
        style={{ cursor: editando ? 'text' : 'move' }}
      />
      <div className="absolute bottom-2 left-2 flex items-center space-x-2">
        <button
          className={`p-1 bg-white rounded-full shadow-md hover:bg-red-100 transition-all duration-300 ${
            isLiking ? 'scale-125' : ''
          }`}
          onClick={handleLike}
        >
          <Heart size={16} fill={isLiking ? 'red' : 'none'} color={isLiking ? 'red' : 'black'} />
        </button>
        <span className="text-xs text-gray-500 opacity-50">{nota.likes}</span>
      </div>
      <div className="absolute bottom-2 right-2 text-xs text-gray-500 opacity-50 pointer-events-none select-none">
        {nombreUsuario}
      </div>
    </div>
  );
};

export default NotaAdhesiva;