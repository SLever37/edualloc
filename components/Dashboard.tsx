
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Funcionario, Escola, StatusFuncionario, Funcao } from '../types';
import { obterInsightsRH } from '../services/geminiService';

interface DashboardProps {
  employees: Funcionario[];
  schools: Escola[];
  roles: Funcao[];
}

const CORES = ['#4f46e5', '#ef4444', '#f59e0b', '#10b981', '#6366f1', '#ec4899'];

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

  const statsPorStatus = Object.values(StatusFuncionario).map(status => ({
    name: status,
    value: employees.filter(e => e.status === status).length
  })).filter(s => s.value > 0);

  const statsPorEscola = schools.map(escola => ({
    name: escola.nome.split(' ').pop(),
    total: employees.filter(e => e.escolaId === escola.id).length,
    ativos: employees.filter(e => e.escolaId === escola.id && e.status === StatusFuncionario.ATIVO).length
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Painel de Lotação</h2>
        <p className="text-slate-500 font-medium">Monitoramento em tempo real da rede municipal.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cadeiras Totais</p>
          <p className="text-3xl font-black text-slate-900">{employees.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Efetivo Ativo</p>
          <p className="text-3xl font-black text-emerald-600">{employees.filter(e => e.status === StatusFuncionario.ATIVO).length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Afastamentos</p>
          <p className="text-3xl font-black text-rose-600">{employees.filter(e => e.status !== StatusFuncionario.ATIVO).length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Dobra Ativa</p>
          <p className="text-3xl font-black text-amber-600">{employees.filter(e => e.possuiDobra).length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 mb-6">Lotação por Unidade</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statsPorEscola}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="total" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Cadeiras" />
                <Bar dataKey="ativos" fill="#10b981" radius={[4, 4, 0, 0]} name="Ativos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 mb-6">Distribuição de Status</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statsPorStatus} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value">
                  {statsPorStatus.map((_, index) => <Cell key={index} fill={CORES[index % CORES.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-indigo-900 text-white p-10 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white/20 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            </div>
            <h3 className="text-2xl font-black tracking-tight">Inteligência Artificial RH</h3>
          </div>
          {carregando ? (
            <div className="flex items-center gap-3 text-indigo-200 animate-pulse font-bold">
               <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
               Analisando dados da rede...
            </div>
          ) : (
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-indigo-100 font-medium leading-relaxed bg-white/5 p-6 rounded-2xl border border-white/10">
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
