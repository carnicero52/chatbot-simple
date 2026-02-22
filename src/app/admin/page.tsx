'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, Save, Plus, Trash2, Edit2, LogIn, LogOut,
  Bot, Key, MessageSquare, Upload, FileText, Image, ArrowLeft,
  Sparkles, X
} from 'lucide-react';

interface BotConfig {
  name: string;
  greeting: string;
  placeholder: string;
  password: string;
  aiApiKey: string;
  aiEnabled: boolean;
}

interface QA {
  id: string;
  keywords: string;
  response: string;
}

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [config, setConfig] = useState<BotConfig>({
    name: 'Asistente',
    greeting: '¡Hola! ¿En qué puedo ayudarte?',
    placeholder: 'Escribe tu mensaje...',
    password: '',
    aiApiKey: '',
    aiEnabled: false
  });
  const [qaList, setQaList] = useState<QA[]>([]);
  const [newKeywords, setNewKeywords] = useState('');
  const [newResponse, setNewResponse] = useState('');
  const [editingQA, setEditingQA] = useState<QA | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{name: string, type: string}[]>([]);

  const handleLogin = async () => {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await res.json();
    if (data.success) {
      setLoggedIn(true);
      setError('');
      loadConfig();
      loadQA();
    } else {
      setError('Contraseña incorrecta');
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setPassword('');
  };

  const loadConfig = async () => {
    const res = await fetch('/api/admin/config');
    const data = await res.json();
    setConfig(data);
  };

  const loadQA = async () => {
    const res = await fetch('/api/admin/qa');
    const data = await res.json();
    setQaList(data);
  };

  const saveConfig = async () => {
    setSaving(true);
    await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    setSaving(false);
    alert('Configuración guardada');
  };

  const addQA = async () => {
    if (!newKeywords.trim() || !newResponse.trim()) return;
    const res = await fetch('/api/admin/qa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords: newKeywords, response: newResponse })
    });
    const data = await res.json();
    setQaList([...qaList, data]);
    setNewKeywords('');
    setNewResponse('');
  };

  const updateQA = async () => {
    if (!editingQA) return;
    await fetch('/api/admin/qa', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingQA)
    });
    setQaList(qaList.map(q => q.id === editingQA.id ? editingQA : q));
    setEditingQA(null);
  };

  const deleteQA = async (id: string) => {
    await fetch('/api/admin/qa', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    setQaList(qaList.filter(q => q.id !== id));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    // Simular procesamiento del archivo
    const fileType = file.type.includes('image') ? 'image' : 
                     file.type.includes('pdf') ? 'pdf' : 'doc';
    
    // Agregar a la lista de archivos subidos
    setUploadedFiles(prev => [...prev, { name: file.name, type: fileType }]);
    
    // Crear entrada en la base de conocimiento
    const keywords = file.name.toLowerCase().replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    const response = fileType === 'image' 
      ? `📷 Imagen: ${file.name}` 
      : fileType === 'pdf'
      ? `📄 Documento PDF: ${file.name}`
      : `📝 Documento: ${file.name}`;
    
    await fetch('/api/admin/qa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords, response })
    });
    
    loadQA();
    setUploading(false);
    alert(`Archivo "${file.name}" agregado a la base de conocimiento`);
    e.target.value = '';
  };

  // Login screen
  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-md shadow-2xl border border-slate-700">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Panel de Admin</h1>
            <p className="text-slate-400 text-sm mt-1">Ingresa tu contraseña para continuar</p>
          </div>

          <div className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Contraseña"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button
              onClick={handleLogin}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Entrar
            </button>
          </div>
          
          {/* Enlace para volver al chat */}
          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver al Chat
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Admin panel
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-emerald-400" />
            <h1 className="font-bold text-white">Panel de Administración</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Botón para ir al chat */}
            <a
              href="/"
              className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Chat
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Bot Config */}
        <section className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Bot className="w-5 h-5 text-emerald-400" />
            Configuración del Bot
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 block mb-1">Nombre del Bot</label>
              <input
                type="text"
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-1">Mensaje de Bienvenida</label>
              <textarea
                value={config.greeting}
                onChange={(e) => setConfig({ ...config, greeting: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-1">Placeholder del Input</label>
              <input
                type="text"
                value={config.placeholder}
                onChange={(e) => setConfig({ ...config, placeholder: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-1">Nueva Contraseña (dejar vacío para mantener)</label>
              <input
                type="password"
                value={config.password}
                onChange={(e) => setConfig({ ...config, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              onClick={saveConfig}
              disabled={saving}
              className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        </section>

        {/* Upload Files */}
        <section className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-emerald-400" />
            Subir Archivos
          </h2>
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              Sube archivos PDF, documentos o imágenes. Se agregarán automáticamente a la base de conocimiento.
            </p>
            <label className="flex flex-col items-center justify-center gap-3 w-full px-6 py-8 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-emerald-500 transition-colors bg-slate-700/50">
              {uploading ? (
                <div className="text-slate-400">Subiendo...</div>
              ) : (
                <>
                  <div className="flex gap-4">
                    <FileText className="w-8 h-8 text-slate-400" />
                    <Image className="w-8 h-8 text-slate-400" />
                  </div>
                  <span className="text-slate-400 text-sm">
                    PDF, DOC, TXT o Imágenes (JPG, PNG)
                  </span>
                </>
              )}
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
            
            {/* Lista de archivos subidos */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-slate-400">Archivos subidos:</p>
                {uploadedFiles.map((file, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-slate-700 rounded-lg">
                    {file.type === 'image' ? (
                      <Image className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <FileText className="w-4 h-4 text-emerald-400" />
                    )}
                    <span className="text-sm text-white">{file.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* AI Config */}
        <section className="bg-slate-800 rounded-2xl p-6 border border-slate-700 border-l-4 border-l-yellow-500">
          <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Configuración de IA (Próximamente)
          </h2>
          <p className="text-sm text-slate-400 mb-4">
            Conecta una API de IA para respuestas más inteligentes. Esta función estará disponible pronto.
          </p>
          <div className="space-y-4 opacity-50 pointer-events-none">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.aiEnabled}
                onChange={(e) => setConfig({ ...config, aiEnabled: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <label className="text-sm text-white">Habilitar respuestas con IA</label>
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-1">API Key de OpenAI</label>
              <input
                type="password"
                value={config.aiApiKey}
                onChange={(e) => setConfig({ ...config, aiApiKey: e.target.value })}
                placeholder="sk-..."
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </section>

        {/* Add Q&A */}
        <section className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-400" />
            Agregar Respuesta
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 block mb-1">Palabras Clave (separadas por coma)</label>
              <input
                type="text"
                value={newKeywords}
                onChange={(e) => setNewKeywords(e.target.value)}
                placeholder="precio, costo, cuánto cuesta"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-1">Respuesta</label>
              <textarea
                value={newResponse}
                onChange={(e) => setNewResponse(e.target.value)}
                placeholder="Escribe la respuesta del bot..."
                rows={3}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              onClick={addQA}
              className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Agregar
            </button>
          </div>
        </section>

        {/* Q&A List */}
        <section className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            Base de Conocimiento ({qaList.length})
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {qaList.map((qa) => (
              <div key={qa.id} className="bg-slate-700 rounded-lg p-4">
                {editingQA?.id === qa.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editingQA.keywords}
                      onChange={(e) => setEditingQA({ ...editingQA, keywords: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm focus:outline-none"
                    />
                    <textarea
                      value={editingQA.response}
                      onChange={(e) => setEditingQA({ ...editingQA, response: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm resize-none focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button onClick={updateQA} className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">
                        Guardar
                      </button>
                      <button onClick={() => setEditingQA(null)} className="flex-1 py-2 bg-slate-600 text-white rounded-lg text-sm hover:bg-slate-500">
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-emerald-400 mb-1">{qa.keywords}</p>
                      <p className="text-sm text-white">{qa.response}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => setEditingQA(qa)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-600 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteQA(qa.id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {qaList.length === 0 && (
              <p className="text-slate-400 text-center py-4">No hay respuestas configuradas</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
