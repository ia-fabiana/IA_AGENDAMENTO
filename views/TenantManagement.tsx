
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Copy, 
  Check,
  DollarSign,
  Search,
  X,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { tenantService, Tenant, CreateTenantInput } from '../services/tenantService';

const TenantManagement: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState<CreateTenantInput>({
    nome_negocio: '',
    plano: 'Bronze',
    saldo_creditos: 100,
  });

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    setLoading(true);
    try {
      const data = await tenantService.listTenants();
      setTenants(data);
    } catch (error) {
      console.error('Erro ao carregar tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await tenantService.createTenant(formData);
      setShowCreateModal(false);
      setFormData({ nome_negocio: '', plano: 'Bronze', saldo_creditos: 100 });
      loadTenants();
    } catch (error) {
      console.error('Erro ao criar tenant:', error);
      alert('Erro ao criar cliente');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;

    try {
      await tenantService.updateTenant(selectedTenant.id, formData);
      setShowEditModal(false);
      setSelectedTenant(null);
      loadTenants();
    } catch (error) {
      console.error('Erro ao atualizar tenant:', error);
      alert('Erro ao atualizar cliente');
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja deletar "${nome}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      await tenantService.deleteTenant(id);
      loadTenants();
    } catch (error) {
      console.error('Erro ao deletar tenant:', error);
      alert('Erro ao deletar cliente');
    }
  };

  const handleCopyLink = (tenantId: string) => {
    const link = tenantService.generateTenantLink(tenantId);
    navigator.clipboard.writeText(link);
    setCopiedId(tenantId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openEditModal = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setFormData({
      nome_negocio: tenant.nome_negocio,
      plano: tenant.plano,
      saldo_creditos: tenant.saldo_creditos,
    });
    setShowEditModal(true);
  };

  const filteredTenants = tenants.filter(t => 
    t.nome_negocio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-brand-dark flex items-center gap-2">
            <Users className="w-7 h-7 text-brand-purple" />
            Gerenciar Clientes
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {tenants.length} cliente{tenants.length !== 1 ? 's' : ''} cadastrado{tenants.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-brand-purple text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-brand-purple/30 hover:bg-brand-purple/90 transition-all"
        >
          <Plus className="w-4 h-4" />
          Novo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-purple outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
          </div>
        ) : filteredTenants.length === 0 ? (
          <div className="text-center p-12">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">Nenhum cliente encontrado</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Cliente</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase">Plano</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase">Créditos</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase">Criado em</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-purple/10 text-brand-purple flex items-center justify-center font-black text-sm">
                        {tenant.nome_negocio.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-brand-dark">{tenant.nome_negocio}</p>
                        <p className="text-xs text-slate-400 font-mono">{tenant.id.substring(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      tenant.plano === 'Ouro' ? 'bg-amber-100 text-amber-700' :
                      tenant.plano === 'Prata' ? 'bg-slate-200 text-slate-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {tenant.plano}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-brand-dark">{tenant.saldo_creditos}</span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-slate-500">
                    {new Date(tenant.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleCopyLink(tenant.id)}
                        className="p-2 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-all"
                        title="Copiar link de acesso"
                      >
                        {copiedId === tenant.id ? (
                          <Check className="w-4 h-4 text-brand-green" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => window.open(tenantService.generateTenantLink(tenant.id), '_blank')}
                        className="p-2 text-slate-400 hover:text-brand-purple hover:bg-brand-purple/10 rounded-lg transition-all"
                        title="Abrir painel do cliente"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(tenant)}
                        className="p-2 text-slate-400 hover:text-brand-purple hover:bg-brand-purple/10 rounded-lg transition-all"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tenant.id, tenant.nome_negocio)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Deletar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-brand-dark">Novo Cliente</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-slate-400 hover:text-brand-dark rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                  Nome do Negócio
                </label>
                <input
                  type="text"
                  value={formData.nome_negocio}
                  onChange={(e) => setFormData({ ...formData, nome_negocio: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-purple outline-none"
                  placeholder="Ex: Salão da Maria"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                  Plano
                </label>
                <select
                  value={formData.plano}
                  onChange={(e) => setFormData({ ...formData, plano: e.target.value as any })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-purple outline-none"
                >
                  <option value="Grátis">Grátis</option>
                  <option value="Bronze">Bronze</option>
                  <option value="Prata">Prata</option>
                  <option value="Ouro">Ouro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                  Créditos Iniciais
                </label>
                <input
                  type="number"
                  value={formData.saldo_creditos}
                  onChange={(e) => setFormData({ ...formData, saldo_creditos: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-purple outline-none"
                  min="0"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-brand-purple text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-purple/30 hover:bg-brand-purple/90 transition-all"
                >
                  Criar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedTenant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-brand-dark">Editar Cliente</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 text-slate-400 hover:text-brand-dark rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                  Nome do Negócio
                </label>
                <input
                  type="text"
                  value={formData.nome_negocio}
                  onChange={(e) => setFormData({ ...formData, nome_negocio: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-purple outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                  Plano
                </label>
                <select
                  value={formData.plano}
                  onChange={(e) => setFormData({ ...formData, plano: e.target.value as any })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-purple outline-none"
                >
                  <option value="Grátis">Grátis</option>
                  <option value="Bronze">Bronze</option>
                  <option value="Prata">Prata</option>
                  <option value="Ouro">Ouro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                  Saldo de Créditos
                </label>
                <input
                  type="number"
                  value={formData.saldo_creditos}
                  onChange={(e) => setFormData({ ...formData, saldo_creditos: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-purple outline-none"
                  min="0"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-brand-purple text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-purple/30 hover:bg-brand-purple/90 transition-all"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantManagement;
