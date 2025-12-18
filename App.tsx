
import React, { useState, useRef, useEffect } from 'react';
import { 
  Square, 
  Smartphone, 
  Plus, 
  Type as TypeIcon, 
  Image as ImageIcon, 
  Database, 
  Download, 
  Layers as LayersIcon, 
  Eye, 
  EyeOff, 
  Trash2, 
  ChevronUp, 
  ChevronDown,
  Activity,
  Zap,
  Search,
  Package,
  Tag,
  CreditCard,
  Lock,
  Unlock,
  Globe,
  AlertCircle,
  Upload,
  RefreshCw,
  Settings,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Hash,
  DollarSign,
  Info,
  ShoppingBag
} from 'lucide-react';
import { Stage, Layer as KonvaLayer, Text as KonvaText, Rect, Transformer } from 'react-konva';
import JSZip from 'jszip';
import FileSaver from 'file-saver';
import { Layer, CanvasFormat, VTEXProduct, LayerType } from './types';
import { FORMATS, FONTS } from './constants';
import DynamicImage from './components/DynamicImage';

// ===== VTEX PRIVATE CONFIG (PardoHogar) =====
const ACCOUNT = "pardohogar";
const ENV = "vtexcommercestable";
const APP_KEY = "vtexappkey-pardohogar-RGREKS";
const APP_TOKEN = "BLPRJNMVSHCRPLWWPYZGMSIEACGWYPSJOZLNKXYRDCRGHEXOMPPMNDVICUKEAPDGGYMPEFMTFVAROKWXFLFYYPAOKDYIYXLDVFBTKIOYOZKHVJVWPBTNLMAYVOHUBRBT";
const SELLER = "1";
const SALES_CHANNEL = "1";
// ===========================================

const App: React.FC = () => {
  const [format, setFormat] = useState<CanvasFormat>(FORMATS.SQUARE);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFetchingCluster, setIsFetchingCluster] = useState(false);
  const [clusterId, setClusterId] = useState('1970');
  const [activeProducts, setActiveProducts] = useState<VTEXProduct[]>([]);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(0.5); // Default zoom at 50%
  
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const staticImageInputRef = useRef<HTMLInputElement>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));
    console.log(`[VTEX Connect]: ${msg}`);
  };

  useEffect(() => {
    if (selectedId && transformerRef.current && stageRef.current) {
      const selectedNode = stageRef.current.findOne('#' + selectedId);
      // Solo mostrar el transformador si la capa no está bloqueada
      const layer = layers.find(l => l.id === selectedId);
      if (selectedNode && !layer?.locked) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer().batchDraw();
      } else {
        transformerRef.current.nodes([]);
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
    }
  }, [selectedId, layers]);

  const fetchClusterData = async () => {
    if (!clusterId.trim()) return;
    setIsFetchingCluster(true);
    setConnectionError(null);
    addLog(`Consultando Cluster ${clusterId} en Pardo...`);
    
    const targetUrl = `https://www.pardo.com.ar/api/catalog_system/pub/products/search?fq=productClusterIds:${clusterId.trim()}&_from=0&_to=49&ts=${Date.now()}`;
    
    try {
        let responseData;
        try {
            const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`);
            if (!res.ok) throw new Error("AllOrigins falló");
            const json = await res.json();
            responseData = JSON.parse(json.contents);
        } catch (err) {
            addLog("AllOrigins falló, reintentando con proxy secundario...");
            const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(targetUrl)}`);
            if (!res.ok) throw new Error("CORSProxy falló");
            responseData = await res.json();
        }

        if (!Array.isArray(responseData) || responseData.length === 0) {
          throw new Error("No se encontraron productos en este cluster.");
        }
        
        const mapped: VTEXProduct[] = responseData.map((p: any) => {
            const offer = p.items[0].sellers[0].commertialOffer;
            const optimizedImageUrl = `https://wsrv.nl/?url=${encodeURIComponent(p.items[0].images[0].imageUrl.split('?')[0])}&w=1200&h=1200&output=jpg&fit=contain&bg=white`;

            return {
                productId: p.productId,
                productName: p.productName,
                brand: p.brand,
                items: [
                  {
                    images: [{ imageUrl: optimizedImageUrl }],
                    sellers: [
                      {
                        commertialOffer: {
                          Price: offer.Price,
                          ListPrice: offer.ListPrice,
                          AvailableQuantity: offer.AvailableQuantity,
                          Installments: offer.Installments
                        }
                      }
                    ]
                  }
                ]
            };
        });
        
        setActiveProducts(mapped);
        setCurrentProductIndex(0);
        addLog(`Éxito: ${mapped.length} productos listos.`);
    } catch (e: any) {
        const msg = e.message || "Error al conectar con VTEX.";
        setConnectionError(msg);
        addLog(`Fallo: ${msg}`);
    } finally {
        setIsFetchingCluster(false);
    }
  };

  const addLayer = (type: LayerType, placeholder?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    let defaultText = placeholder || 'EDITAR TEXTO';
    
    if (placeholder === '{{Installments}}') defaultText = '{n} CUOTAS SIN INTERÉS DE ${v}';
    if (placeholder === '{{InstallmentCount}}') defaultText = '{n}';
    if (placeholder === '{{InstallmentValue}}') defaultText = '${v}';
    if (placeholder === '{{InstallmentType}}') defaultText = 'CUOTAS SIN INTERÉS';
    if (placeholder === '{{ProductName}}') defaultText = 'NOMBRE DEL PRODUCTO';

    const newLayer: Layer = {
      id,
      name: placeholder ? placeholder.replace(/[{}]/g, '') : `${type.charAt(0)}${type.slice(1).toLowerCase()} ${layers.length + 1}`,
      type,
      x: format.width / 4,
      y: format.height / 4,
      width: type === 'IMAGE' || type === 'DYNAMIC_IMAGE' ? 500 : 600,
      height: type === 'IMAGE' || type === 'DYNAMIC_IMAGE' ? 500 : 150,
      rotation: 0,
      visible: true,
      opacity: 1,
      locked: false,
      placeholderKey: placeholder as any,
    };

    if (type === 'TEXT' || type === 'DYNAMIC_TEXT' || type === 'DYNAMIC_BADGE') {
      newLayer.text = defaultText;
      newLayer.fontSize = 80;
      newLayer.fontFamily = 'Exo';
      newLayer.fill = '#000000';
      newLayer.fontStyle = 'bold';
      newLayer.align = 'center';
    } else if (type === 'IMAGE') {
      newLayer.url = 'https://picsum.photos/seed/pardo/1000/1000';
    }

    setLayers(prev => [...prev, newLayer]);
    setSelectedId(id);
    addLog(`Capa añadida.`);
  };

  const updateLayer = (id: string, updates: Partial<Layer>) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const removeLayer = (id: string) => {
    setLayers(prev => prev.filter(l => l.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleDragStart = (index: number) => setDraggedItemIndex(index);

  const handleDragEnter = (targetIndex: number) => {
    if (draggedItemIndex === null || draggedItemIndex === targetIndex) return;
    const newLayers = [...layers];
    const draggedItem = newLayers[draggedItemIndex];
    newLayers.splice(draggedItemIndex, 1);
    newLayers.splice(targetIndex, 0, draggedItem);
    setLayers(newLayers);
    setDraggedItemIndex(targetIndex);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDragEnd = () => setDraggedItemIndex(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const id = Math.random().toString(36).substr(2, 9);
        
        const img = new Image();
        img.src = url;
        img.onload = () => {
          const maxWidth = 800;
          const ratio = img.width / img.height;
          const finalWidth = Math.min(img.width, maxWidth);
          const finalHeight = finalWidth / ratio;

          setLayers(prev => [...prev, {
            id, 
            name: file.name, 
            type: 'IMAGE', 
            x: format.width / 4, 
            y: format.height / 4,
            width: finalWidth, 
            height: finalHeight, 
            rotation: 0, 
            visible: true, 
            opacity: 1, 
            locked: false,
            url: url,
          }]);
          setSelectedId(id);
          addLog("Imagen cargada con éxito.");
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const processBatch = async () => {
    if (activeProducts.length === 0) return;
    setIsProcessing(true);
    addLog("Generando lote de imágenes...");
    const zip = new JSZip();
    const originalSelected = selectedId;
    const originalLayers = [...layers];
    const originalIndex = currentProductIndex;
    setSelectedId(null);
    
    for (let i = 0; i < activeProducts.length; i++) {
      setCurrentProductIndex(i);
      setProgress(Math.round(((i + 1) / activeProducts.length) * 100));
      await new Promise(resolve => setTimeout(resolve, 600));
      if (stageRef.current) {
        const dataUrl = stageRef.current.toDataURL({ pixelRatio: 1.5 });
        const base64Data = dataUrl.replace(/^data:image\/(png|jpg);base64,/, "");
        zip.file(`pardo_${activeProducts[i].productId}.png`, base64Data, { base64: true });
      }
    }
    
    setLayers(originalLayers);
    setCurrentProductIndex(originalIndex);
    const content = await zip.generateAsync({ type: "blob" });
    FileSaver.saveAs(content, `campania_pardo_cluster_${clusterId}.zip`);
    setSelectedId(originalSelected);
    setIsProcessing(false);
    setProgress(0);
    addLog("Lote finalizado.");
  };

  const handleStageClick = (e: any) => {
    if (e.target === e.target.getStage()) setSelectedId(null);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.1));

  const selectedLayer = layers.find(l => l.id === selectedId);
  const currentProduct = activeProducts[currentProductIndex];

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800 font-sans overflow-hidden">
      <div className="w-80 bg-white border-r flex flex-col shadow-lg z-10">
        <div className="p-6 border-b bg-indigo-600 text-white flex items-center gap-3">
          <Zap className="w-8 h-8 fill-yellow-400 text-yellow-400" />
          <h1 className="text-xl font-black tracking-tight uppercase">Pardo Builder</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Smartphone className="w-3 h-3" /> Formato de Canvas
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(FORMATS).map(f => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f)}
                  className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                    format.id === f.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-100 hover:border-gray-300'
                  }`}
                >
                  {f.id === 'SQUARE' ? <Square className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                  <span className="text-xs font-semibold">{f.name}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="bg-slate-50 p-5 rounded-[24px] border border-slate-200/60 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-indigo-400" /> Catálogo Pardo
            </h3>
            <div className="space-y-4">
              <div className="flex gap-2 bg-white p-1 rounded-2xl shadow-inner border border-slate-100">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    type="text"
                    value={clusterId}
                    onChange={(e) => setClusterId(e.target.value)}
                    placeholder="ID Cluster"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border-none bg-transparent focus:ring-0 outline-none text-sm font-bold text-slate-700 placeholder:text-slate-300"
                  />
                </div>
                <button
                  onClick={fetchClusterData}
                  disabled={isFetchingCluster}
                  className="bg-indigo-500 text-white p-2.5 rounded-xl hover:bg-indigo-600 disabled:opacity-50 transition-all shadow-lg"
                >
                  {isFetchingCluster ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Search size={18} />}
                </button>
              </div>

              {activeProducts.length > 0 && (
                <div className="space-y-3 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Navegador</div>
                    <div className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
                      {currentProductIndex + 1} / {activeProducts.length}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentProductIndex(prev => Math.max(0, prev - 1))} disabled={currentProductIndex === 0} className="flex-1 py-2 bg-slate-50 rounded-xl disabled:opacity-30"><ChevronLeft className="mx-auto" size={18} /></button>
                    <button onClick={() => setCurrentProductIndex(prev => Math.min(activeProducts.length - 1, prev + 1))} disabled={currentProductIndex === activeProducts.length - 1} className="flex-1 py-2 bg-slate-50 rounded-xl disabled:opacity-30"><ChevronRight className="mx-auto" size={18} /></button>
                  </div>
                  <div className="text-[11px] font-bold text-slate-700 truncate text-center">{currentProduct?.productName}</div>
                </div>
              )}
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <LayersIcon className="w-3 h-3" /> Capas
            </h3>
            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
              {layers.slice().reverse().map((l, visualIndex) => {
                const actualIndex = layers.length - 1 - visualIndex;
                const isDragging = draggedItemIndex === actualIndex;
                return (
                  <div
                    key={l.id} draggable={!l.locked} onDragStart={() => handleDragStart(actualIndex)} onDragEnter={() => handleDragEnter(actualIndex)} onDragOver={handleDragOver} onDragEnd={handleDragEnd}
                    onClick={() => setSelectedId(l.id)}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-grab border transition-all ${selectedId === l.id ? 'bg-indigo-50 border-indigo-200 shadow-md' : 'bg-white border-gray-100 hover:bg-slate-50'} ${isDragging ? 'opacity-30 scale-95' : ''} ${l.locked ? 'cursor-default opacity-80' : ''}`}
                  >
                    <div className="w-7 h-7 bg-gray-100 rounded flex items-center justify-center text-gray-500 shrink-0">{l.type.includes('IMAGE') ? <ImageIcon size={14} /> : <TypeIcon size={14} />}</div>
                    <div className="flex-1 min-w-0"><p className="text-[10px] font-bold truncate uppercase text-slate-600">{l.name}</p></div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); updateLayer(l.id, { locked: !l.locked }); }} 
                        className={`p-1 transition-colors ${l.locked ? 'text-indigo-600' : 'text-slate-300 hover:text-indigo-400'}`}
                      >
                        {l.locked ? <Lock size={14} /> : <Unlock size={14} />}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); removeLayer(l.id); }} className="p-1 text-red-400 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="p-4 bg-gray-50 border-t space-y-3">
          <button onClick={processBatch} disabled={isProcessing || activeProducts.length === 0} className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-indigo-700 transition-colors">
            {isProcessing ? <Activity className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            <span>{isProcessing ? `GENERANDO ${progress}%` : 'RENDERIZAR LOTE'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col relative overflow-hidden bg-gray-200">
        <div className="h-16 bg-white border-b flex items-center px-6 justify-between z-10 shadow-sm overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button onClick={() => addLayer('TEXT')} className="p-2.5 hover:bg-white rounded-lg transition-all"><TypeIcon size={20} /></button>
              
              <input type="file" ref={staticImageInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
              <button onClick={() => staticImageInputRef.current?.click()} className="p-2.5 hover:bg-white rounded-lg transition-all" title="Añadir Imagen"><ImageIcon size={20} /></button>
              
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/png" />
              <button onClick={() => fileInputRef.current?.click()} className="p-2.5 hover:bg-white rounded-lg transition-all" title="Subir Marco PNG"><Upload size={20} /></button>
            </div>
            
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-2">
              <button onClick={() => addLayer('DYNAMIC_IMAGE', '{{ProductImage}}')} className="shrink-0 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg text-[9px] font-black border border-yellow-200 flex items-center gap-1 hover:bg-yellow-100 transition-colors"><ImageIcon size={10} /> IMAGEN</button>
              <button onClick={() => addLayer('DYNAMIC_TEXT', '{{ProductName}}')} className="shrink-0 px-3 py-1.5 bg-fuchsia-50 text-fuchsia-700 rounded-lg text-[9px] font-black border border-fuchsia-200 flex items-center gap-1 hover:bg-fuchsia-100 transition-colors"><ShoppingBag size={10} /> NOMBRE</button>
              <button onClick={() => addLayer('DYNAMIC_TEXT', '{{Price}}')} className="shrink-0 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-[9px] font-black border border-green-200 flex items-center gap-1 hover:bg-green-100 transition-colors"><Tag size={10} /> PRECIO</button>
              <button onClick={() => addLayer('DYNAMIC_TEXT', '{{Installments}}')} className="shrink-0 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-[9px] font-black border border-blue-200 flex items-center gap-1 hover:bg-blue-100 transition-colors"><CreditCard size={10} /> PACK CUOTAS</button>
              <button onClick={() => addLayer('DYNAMIC_TEXT', '{{InstallmentCount}}')} className="shrink-0 px-3 py-1.5 bg-slate-50 text-slate-700 rounded-lg text-[9px] font-black border border-slate-200 flex items-center gap-1 hover:bg-slate-100 transition-colors"><Hash size={10} /> #CUOTAS</button>
              <button onClick={() => addLayer('DYNAMIC_TEXT', '{{InstallmentValue}}')} className="shrink-0 px-3 py-1.5 bg-slate-50 text-slate-700 rounded-lg text-[9px] font-black border border-slate-200 flex items-center gap-1 hover:bg-slate-100 transition-colors"><DollarSign size={10} /> $VALOR</button>
              <button onClick={() => addLayer('DYNAMIC_TEXT', '{{InstallmentType}}')} className="shrink-0 px-3 py-1.5 bg-slate-50 text-slate-700 rounded-lg text-[9px] font-black border border-slate-200 flex items-center gap-1 hover:bg-slate-100 transition-colors"><Info size={10} /> TIPO</button>
              <button onClick={() => addLayer('DYNAMIC_BADGE', '{{Badge}}')} className="shrink-0 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-[9px] font-black border border-red-200 flex items-center gap-1 hover:bg-red-100 transition-colors"><Zap size={10} /> OFF</button>
            </div>
          </div>

          <div className="flex items-center gap-4 ml-4">
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-full px-1.5 py-1 gap-2">
                <button onClick={handleZoomOut} className="p-1.5 hover:bg-white rounded-full text-slate-500 transition-colors"><ZoomOut size={16} /></button>
                <span className="text-[10px] font-black text-slate-600 min-w-[36px] text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={handleZoomIn} className="p-1.5 hover:bg-white rounded-full text-slate-500 transition-colors"><ZoomIn size={16} /></button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-12 flex items-center justify-center pattern-grid scrollbar-none">
          <div className="bg-white shadow-2xl relative transition-all" style={{ width: format.width * zoom, height: format.height * zoom }}>
            <div className="absolute inset-0 origin-top-left" style={{ transform: `scale(${zoom})` }}>
              <Stage width={format.width} height={format.height} ref={stageRef} onMouseDown={handleStageClick}>
                <KonvaLayer>
                  <Rect x={0} y={0} width={format.width} height={format.height} fill="#FFFFFF" />
                  {layers.map((layer) => {
                    if (!layer.visible) return null;
                    const commonProps = {
                      key: layer.id, id: layer.id, x: layer.x, y: layer.y,
                      width: layer.width, height: layer.height, rotation: layer.rotation, opacity: layer.opacity,
                      draggable: !isProcessing && !layer.locked,
                      listening: !layer.locked, // Desactivar eventos del mouse si está bloqueada para poder "cliquear a través"
                      onDragEnd: (e: any) => updateLayer(layer.id, { x: e.target.x(), y: e.target.y() }),
                      onTransformEnd: (e: any) => {
                        const node = e.target;
                        updateLayer(layer.id, { x: node.x(), y: node.y(), width: node.width() * node.scaleX(), height: node.height() * node.scaleY(), rotation: node.rotation() });
                        node.scaleX(1); node.scaleY(1);
                      },
                      onClick: () => setSelectedId(layer.id),
                      onTap: () => setSelectedId(layer.id)
                    };

                    if (layer.type === 'IMAGE' || layer.type === 'DYNAMIC_IMAGE') {
                      let url = layer.url || 'https://via.placeholder.com/500';
                      if (layer.type === 'DYNAMIC_IMAGE' && currentProduct) url = currentProduct.items[0]?.images[0]?.imageUrl || url;
                      return <DynamicImage {...commonProps} url={url} />;
                    }

                    if (layer.type === 'TEXT' || layer.type === 'DYNAMIC_TEXT' || layer.type === 'DYNAMIC_BADGE') {
                      let text = layer.text || '';
                      if ((layer.type === 'DYNAMIC_TEXT' || layer.type === 'DYNAMIC_BADGE') && currentProduct) {
                        const offer = currentProduct.items[0].sellers[0].commertialOffer;
                        if (layer.placeholderKey === '{{ProductName}}') {
                           text = currentProduct.productName;
                        } else if (layer.placeholderKey === '{{Price}}') {
                           text = `$ ${offer.Price.toLocaleString('es-AR')}`;
                        } else if (layer.placeholderKey === '{{Badge}}') {
                           const discount = Math.round(((offer.ListPrice - offer.Price) / offer.ListPrice) * 100);
                           text = discount > 0 ? `${discount}% OFF` : 'OFERTA';
                        } else if (layer.placeholderKey?.startsWith('{{Installment')) {
                           const best = offer.Installments?.sort((a, b) => b.NumberOfInstallments - a.NumberOfInstallments)[0];
                           if (best) {
                              let template = layer.text || '';
                              const nStr = String(best.NumberOfInstallments);
                              const vStr = `$ ${best.Value.toLocaleString('es-AR')}`;
                              
                              if (layer.placeholderKey === '{{InstallmentCount}}') text = template.replace(/{n}/g, nStr);
                              else if (layer.placeholderKey === '{{InstallmentValue}}') text = template.replace(/{v}/g, vStr);
                              else if (layer.placeholderKey === '{{InstallmentType}}') text = template;
                              else text = template.replace(/{n}/g, nStr).replace(/{v}/g, vStr);
                           }
                        }
                      }
                      return <KonvaText {...commonProps} text={text} fontSize={layer.fontSize} fontFamily={layer.fontFamily} fill={layer.fill} fontStyle={layer.fontStyle} align={layer.align} />;
                    }
                    return null;
                  })}
                  {selectedId && !isProcessing && (
                    <Transformer 
                      ref={transformerRef} 
                      rotateEnabled={true} 
                      borderStrokeWidth={3} 
                      anchorSize={12} 
                      anchorStrokeWidth={2}
                      borderStroke="#6366f1"
                      anchorCornerRadius={3}
                    />
                  )}
                </KonvaLayer>
              </Stage>
            </div>
          </div>
        </div>

        <div className="h-24 bg-slate-900 text-slate-500 p-2 font-mono text-[9px] overflow-y-auto border-t border-slate-800 scrollbar-thin">
          {logs.map((log, i) => <div key={i} className={log.includes('Éxito') ? 'text-emerald-500' : log.includes('Fallo') ? 'text-rose-500' : ''}>{log}</div>)}
        </div>
      </div>

      {selectedId && selectedLayer && (
        <div className="w-72 bg-white border-l shadow-2xl p-6 flex flex-col gap-6 overflow-y-auto scrollbar-thin">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="font-black uppercase text-[10px] tracking-[0.2em] text-indigo-600 flex items-center gap-2"><Settings size={14} /> Propiedades</h2>
            <button 
              onClick={() => updateLayer(selectedLayer.id, { locked: !selectedLayer.locked })}
              className={`p-2 rounded-lg transition-all ${selectedLayer.locked ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
              title={selectedLayer.locked ? "Desbloquear capa" : "Bloquear capa"}
            >
              {selectedLayer.locked ? <Lock size={16} /> : <Unlock size={16} />}
            </button>
          </div>

          <div className="space-y-5">
            {(selectedLayer.type.includes('TEXT') || selectedLayer.type.includes('BADGE')) && (
              <>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    {selectedLayer.placeholderKey?.includes('Installment') ? 'Plantilla ( {n}=cant, {v}=valor )' : 'Contenido'}
                  </label>
                  <input type="text" value={selectedLayer.text || ''} onChange={(e) => updateLayer(selectedLayer.id, { text: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50/50 outline-none focus:ring-2 focus:ring-indigo-100" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Fuente</label>
                  <select value={selectedLayer.fontFamily} onChange={(e) => updateLayer(selectedLayer.id, { fontFamily: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50/50 outline-none">
                    {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Size</label>
                    <input type="number" value={selectedLayer.fontSize} onChange={(e) => updateLayer(selectedLayer.id, { fontSize: parseInt(e.target.value) || 0 })} className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50/50 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Color</label>
                    <input type="color" value={selectedLayer.fill} onChange={(e) => updateLayer(selectedLayer.id, { fill: e.target.value })} className="w-full h-10 p-1 border border-slate-200 rounded-xl cursor-pointer bg-white" />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex justify-between">
                <span>Opacidad</span>
                <span className="text-indigo-500">{Math.round(selectedLayer.opacity * 100)}%</span>
              </label>
              <input type="range" min="0" max="1" step="0.1" value={selectedLayer.opacity} onChange={(e) => updateLayer(selectedLayer.id, { opacity: parseFloat(e.target.value) })} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
            </div>

            <div className="pt-6 border-t border-slate-100">
              <button onClick={() => removeLayer(selectedLayer.id)} className="w-full py-3 text-[10px] font-black text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-xl flex items-center justify-center gap-2 border border-rose-100 active:scale-95 transition-all">
                <Trash2 size={14} /> ELIMINAR CAPA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
