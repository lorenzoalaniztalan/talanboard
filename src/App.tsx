import React, { useState, useRef, useCallback, useEffect } from 'react';
import NotaAdhesiva from './components/NotaAdhesiva';
import Login from './components/Login';
import { ZoomIn, ZoomOut } from 'lucide-react';

export const colores = ['#fef68a', '#ffd7d7', '#fff8b8', '#b1e4ff', '#d9e8fc', '#e7feff'];

interface Nota {
  id: number;
  contenido: string;
  x: number;
  y: number;
  color: string;
  likes: number;
  emoji: string;
}

function App() {
  const [notas, setNotas] = useState<Nota[]>([]);
  const [nombreUsuario, setNombreUsuario] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const boardRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const lastPanPositionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY;
      setZoom((prevZoom) => {
        const newZoom = prevZoom - delta * 0.001;
        return Math.min(Math.max(newZoom, 0.5), 2);
      });
    };

    const board = boardRef.current;
    if (board) {
      board.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (board) {
        board.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      isDraggingRef.current = true;
      lastPanPositionRef.current = { x: e.clientX, y: e.clientY };
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      const deltaX = e.clientX - lastPanPositionRef.current.x;
      const deltaY = e.clientY - lastPanPositionRef.current.y;
      setPan((prevPan) => ({
        x: prevPan.x + deltaX,
        y: prevPan.y + deltaY,
      }));
      lastPanPositionRef.current = { x: e.clientX, y: e.clientY };
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const agregarNota = useCallback((e: React.MouseEvent) => {
    if (e.target !== boardRef.current) return;
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    const nuevaNota: Nota = {
      id: Date.now(),
      contenido: '',
      x,
      y,
      color: colores[Math.floor(Math.random() * colores.length)],
      likes: 0,
      emoji: '',
    };
    setNotas((prevNotas) => [...prevNotas, nuevaNota]);
  }, [zoom, pan]);

  const actualizarNota = useCallback((id: number, nuevoContenido: string) => {
    setNotas((prevNotas) =>
      prevNotas.map((nota) =>
        nota.id === id ? { ...nota, contenido: nuevoContenido } : nota
      )
    );
  }, []);

  const moverNota = useCallback((id: number, x: number, y: number) => {
    setNotas((prevNotas) =>
      prevNotas.map((nota) => (nota.id === id ? { ...nota, x, y } : nota))
    );
  }, []);

  const cambiarColorNota = useCallback((id: number) => {
    setNotas((prevNotas) =>
      prevNotas.map((nota) => {
        if (nota.id === id) {
          const currentIndex = colores.indexOf(nota.color);
          const nextIndex = (currentIndex + 1) % colores.length;
          return { ...nota, color: colores[nextIndex] };
        }
        return nota;
      })
    );
  }, []);

  const eliminarNota = useCallback((id: number) => {
    setNotas((prevNotas) => prevNotas.filter((nota) => nota.id !== id));
  }, []);

  const likeNota = useCallback((id: number) => {
    setNotas((prevNotas) =>
      prevNotas.map((nota) =>
        nota.id === id ? { ...nota, likes: nota.likes + 1 } : nota
      )
    );
  }, []);

  const setEmojiNota = useCallback((id: number, emoji: string) => {
    setNotas((prevNotas) =>
      prevNotas.map((nota) =>
        nota.id === id ? { ...nota, emoji } : nota
      )
    );
  }, []);

  const handleLogin = useCallback((nombre: string) => {
    setNombreUsuario(nombre);
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom((prevZoom) => Math.min(prevZoom + 0.1, 2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prevZoom) => Math.max(prevZoom - 0.1, 0.5));
  }, []);

  if (!nombreUsuario) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="p-4 flex justify-between items-center glassmorphism">
        <h1 className="text-2xl font-bold animated-gradient-text">Talan Board</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleZoomIn}
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors duration-200"
          >
            <ZoomIn size={20} />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors duration-200"
          >
            <ZoomOut size={20} />
          </button>
          <span className="text-gray-600">Hola, {nombreUsuario}</span>
        </div>
      </div>
      <div
        ref={boardRef}
        className="flex-grow overflow-hidden cursor-move"
        onDoubleClick={agregarNota}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: '0 0',
            width: '100%',
            height: '100%',
            position: 'relative',
          }}
        >
          {notas.map((nota) => (
            <NotaAdhesiva
              key={nota.id}
              nota={nota}
              actualizarNota={actualizarNota}
              moverNota={moverNota}
              cambiarColorNota={cambiarColorNota}
              eliminarNota={eliminarNota}
              likeNota={likeNota}
              setEmojiNota={setEmojiNota}
              nombreUsuario={nombreUsuario}
              zoom={zoom}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;