
import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Funcionario, Escola, StatusFuncionario, Funcao } from '../types.ts';
import { obterInsightsRH } from '../services/geminiService.ts';

interface DashboardProps {
  employees: Funcionario[];
  schools: Escola[];
  roles: Funcao[];
}

const CORES_STATUS: Record<string, string> = {
  [StatusFuncionario.ATIVO]: '#10b981', 
  [StatusFuncionario.INATIVO]: '#94a3b8', 
  [StatusFuncionario.LICENCA_MEDICA]: '#ef4444', 
  [StatusFuncionario.LICENCA_ESPECIAL]: '#f59e0b', 
  [StatusFuncionario.LICENCA_MATERNIDADE]: '#ec4899', 
  [StatusFuncionario.LICENCA_PARTICULAR]: '#6366f1', 
  [StatusFuncionario.FERIAS]: '#3b82f6', 
  [StatusFuncionario.READAPTADO]: '#8b5cf6', 
};

const Dashboard: React.FC<DashboardProps> = ({ employees, schools, roles }) => {
  const [insights, setInsights] = useState<string>('');
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    const carregarInsights = async () => {
      if (employees.length === 0) return;
      setCarregando(true);
      const texto = await obterInsightsRH(employees, schools, roles);
      setInsights(texto || "Sem insights disponíveis.");
      setCarregando(false);
    };
    carregarInsights();
  }, [employees]);

  const statsPorStatus = useMemo(() => {
    return Object.values(StatusFuncionario).map(status => ({
      name: status,
      value: employees.filter(e => e.status === status).length
    })).filter(s => s.value > 0);
  }, [employees]);

  const statsPorEscola = useMemo(() => {
    return schools.map(escola => {
      const staffDaEscola = employees.filter(e => e.escolaId === escola.id);
      return {
        name: escola.nome.length > 15 ? escola.nome.substring(0, 12) + '...' : escola.nome,
        fullName: escola.nome,
        total: staffDaEscola.length,
        ativos: staffDaEscola.filter(e => e.status === StatusFuncionario.ATIVO).length
      };
    }).sort((a, b) => b.total - a.total).slice(0, 8);
  }, [employees, schools]);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Painel de Lotação</h2>
        <p className="text-sm md:text-base text-slate-500 font-medium">Monitoramento em tempo real da rede municipal.</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-200 group hover:border-indigo-500 transition-colors">
          <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">Total de Vínculos</p>
          <p className="text-2xl md:text-3xl font-black text-slate-900">{employees.length}</p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-200 group hover:border-emerald-500 transition-colors">
          <p className="text-[9px] md:text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1 truncate">Efetivo Ativo</p>
          <p className="text-2xl md:text-3xl font-black text-emerald-600">{employees.filter(e => e.status === StatusFuncionario.ATIVO).length}</p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-200 group hover:border-rose-500 transition-colors">
          <p className="text-[9px] md:text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1 truncate">Total Afastados</p>
          <p className="text-2xl md:text-3xl font-black text-rose-600">{employees.filter(e => e.status !== StatusFuncionario.ATIVO).length}</p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-200 group hover:border-amber-500 transition-colors">
          <p className="text-[9px] md:text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1 truncate">Dobra/Carga Extra</p>
          <p className="text-2xl md:text-3xl font-black text-amber-600">{employees.filter(e => e.possuiDobra).length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-black text-slate-800">Lotação por Unidade</h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Top 8 Unidades</span>
          </div>
          <div className="h-72 md:h-80">
            {statsPorEscola.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statsPorEscola}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} width={30} />
                    <Tooltip 
                        cursor={{fill: '#f8fafc'}} 
                        contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px'}}
                        itemStyle={{fontWeight: 800, fontSize: '12px'}}
                    />
                    <Legend iconType="circle" wrapperStyle={{paddingTop: '20px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase'}} />
                    <Bar dataKey="total" fill="#4f46e5" radius={[6, 6, 0, 0]} name="Cadeiras Totais" barSize={32} />
                    <Bar dataKey="ativos" fill="#10b981" radius={[6, 6, 0, 0]} name="Servidores Ativos" barSize={32} />
                </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2"/><path d="M2 12L12 12"/><path d="M12 2L12 12"/></svg>
                    <p className="mt-4 text-xs font-bold uppercase tracking-widest">Aguardando dados...</p>
                </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-black text-slate-800">Status do Efetivo</h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Distribuição %</span>
          </div>
          <div className="h-72 md:h-80">
            {statsPorStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie 
                        data={statsPorStatus} 
                        cx="50%" 
                        cy="50%" 
                        innerRadius={70} 
                        outerRadius={100} 
                        paddingAngle={8} 
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={1500}
                    >
                    {statsPorStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CORES_STATUS[entry.name] || '#cbd5e1'} stroke="none" />
                    ))}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '10px', fontWeight: 700, textTransform: 'uppercase'}} />
                </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                    <p className="text-xs font-bold uppercase tracking-widest">Nenhum dado de status</p>
                </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 text-white p-6 md:p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
          <svg width="240" height="240" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-500/40">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            </div>
            <div>
                <h3 className="text-xl md:text-2xl font-black tracking-tighter">Gemini Insight RH</h3>
                <p className="text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em]">Análise Preditiva de Lotação</p>
            </div>
          </div>
          {carregando ? (
            <div className="flex items-center gap-4 text-indigo-200 animate-pulse bg-white/5 p-8 rounded-[2rem] border border-white/10">
               <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
               <span className="font-bold text-sm uppercase tracking-widest">Processando dados da rede municipal...</span>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none text-sm md:text-base">
              <div className="whitespace-pre-wrap text-indigo-50 font-medium leading-relaxed bg-indigo-950/40 p-6 md:p-8 rounded-[2rem] border border-white/10 shadow-inner">
                {insights}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
