
import React, { useState, useRef } from 'react';
import { Escola, Funcao, Setor, Funcionario, StatusFuncionario, TipoLotacao, Turno } from '../types.ts';

interface ExcelImportModalProps {
  escolas: Escola[];
  funcoes: Funcao[];
  setores: Setor[];
  onImport: (dados: Partial<Funcionario>[]) => Promise<void>;
  onClose: () => void;
}

const ExcelImportModal: React.FC<ExcelImportModalProps> = ({ escolas, funcoes, setores, onImport, onClose }) => {
  const [etapa, setEtapa] = useState<1 | 2 | 3>(1); // 1: Upload, 2: Mapeamento, 3: Processando
  const [fileData, setFileData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapeamento, setMapeamento] = useState({
    nome: '',
    cpf: '',
    matricula: '',
    escola: '',
    funcao: ''
  });
  const [importando, setImportando] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
        const XLSX = await import('xlsx');
        
        const reader = new FileReader();
        reader.onload = (evt) => {
          const bstr = evt.target?.result;
          if (typeof bstr !== 'string') return;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
          
          if (data && data.length > 0) {
            setHeaders(data[0] as string[]);
            setFileData(data.slice(1)); // Remove header
            setEtapa(2);
          }
        };
        reader.readAsBinaryString(file);
    } catch (error) {
        console.error("Erro ao carregar biblioteca XLSX", error);
        alert("Erro ao carregar processador de planilhas. Verifique sua conexão.");
    }
  };

  const processarDados = async () => {
    setEtapa(3);
    setImportando(true);
    
    const funcionariosParaImportar: Partial<Funcionario>[] = [];

    fileData.forEach((row: any) => {
      const getVal = (colName: string) => {
        const idx = headers.indexOf(colName);
        return idx > -1 ? row[idx] : null;
      };

      const nome = getVal(mapeamento.nome);
      if (!nome) return;

      const nomeEscola = getVal(mapeamento.escola);
      const escolaEncontrada = escolas.find(e => 
        e.nome.toLowerCase().includes(String(nomeEscola || '').toLowerCase())
      );

      const nomeFuncao = getVal(mapeamento.funcao);
      const funcaoEncontrada = funcoes.find(f => 
        f.nome.toLowerCase() === String(nomeFuncao || '').toLowerCase()
      );

      funcionariosParaImportar.push({
        nome: String(nome),
        cpf: String(getVal(mapeamento.cpf) || ''),
        matricula: String(getVal(mapeamento.matricula) || `IMP-${Math.floor(Math.random()*10000)}`),
        escolaId: escolaEncontrada?.id || '',
        funcaoId: funcaoEncontrada?.id || funcoes[0]?.id || '',
        setorId: setores[0]?.id || '',
        status: StatusFuncionario.ATIVO,
        // Fix: Property 'DEFINITIVA' does not exist on type 'typeof TipoLotacao'. Changed to 'EFETIVO'.
        tipoLotacao: TipoLotacao.EFETIVO,
        turnos: [Turno.MANHA],
        cargaHoraria: 40,
        possuiDobra: false,
        presencaConfirmada: false
      });
    });

    await onImport(funcionariosParaImportar);
    setImportando(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl flex flex-col shadow-2xl animate-modal overflow-hidden">
        
        <div className="p-6 bg-slate-800 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black tracking-tight">Importação em Massa</h2>
            <p className="text-slate-400 text-xs uppercase tracking-widest mt-1">Curadoria de Dados via Excel/CSV</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div className="p-8">
          {etapa === 1 && (
            <div className="text-center py-10 border-2 border-dashed border-slate-300 rounded-2xl hover:bg-slate-50 transition cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-700">Clique para selecionar arquivo</h3>
              <p className="text-sm text-slate-400 mt-2">Suporta .xlsx ou .csv</p>
              <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
            </div>
          )}

          {etapa === 2 && (
            <div className="space-y-6">
              <div className="bg-indigo-50 p-4 rounded-xl text-indigo-800 text-sm border border-indigo-100">
                <strong>Curadoria de Colunas:</strong> Relacione as colunas do seu arquivo com os campos do sistema. O sistema tentará encontrar Escolas e Cargos automaticamente pelo nome.
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Nome do Servidor *', field: 'nome' },
                  { label: 'Matrícula', field: 'matricula' },
                  { label: 'CPF', field: 'cpf' },
                  { label: 'Nome da Escola (Lotação)', field: 'escola' },
                  { label: 'Cargo / Função', field: 'funcao' },
                ].map((item) => (
                  <div key={item.field}>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</label>
                    <select 
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none focus:border-indigo-500"
                      value={(mapeamento as any)[item.field]}
                      onChange={(e) => setMapeamento({...mapeamento, [item.field]: e.target.value})}
                    >
                      <option value="">-- Ignorar Coluna --</option>
                      {headers.map((h, i) => <option key={i} value={h}>{h}</option>)}
                    </select>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button onClick={() => setEtapa(1)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg transition">Voltar</button>
                <button 
                  onClick={processarDados} 
                  disabled={!mapeamento.nome}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  Processar Importação
                </button>
              </div>
            </div>
          )}

          {etapa === 3 && (
             <div className="text-center py-10">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-lg font-bold text-slate-800">Processando Lotação...</h3>
                <p className="text-sm text-slate-400 mt-2">Isso pode levar alguns segundos.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExcelImportModal;
