import React, { useState, useMemo } from 'react';
import { useAuth } from '../components/AuthContext';
import { Search, Plus, UserPlus, Users, Truck, Shield, Mail, Phone, MapPin, MoreVertical, Edit2, Trash2, Check, X, Filter } from 'lucide-react';
import { Button, Input, Badge, Modal, Switch } from '../components/UI';
import { MOCK_USERS, MOCK_SUPPLIERS } from '../constants';
import { SystemUser, Client } from '../types';
import { createUser, listUsers, updateUser, deleteUser } from '../services/user';
import { createSupplier, updateSupplier, deleteSupplier, listSuppliers } from '../services/supplier';
import { listCategories } from '../services/category';
import { createClient, updateClient, listClients, deleteClient } from '../services/client';
import { FeedbackPopup } from '../components/FeedbackPopup';
import { logUiEvent } from '../services/telemetry';

type EntityTab = 'users' | 'clients' | 'suppliers';

const Entities: React.FC = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [activeTab, setActiveTab] = useState<EntityTab>('users');
  const [searchTerm, setSearchTerm] = useState('');
  
  // States for Modals
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Controlled form state for user modal
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'operator',
    status: true,
    password: '',
    confirmPassword: ''
  });

  // Lista real de usuários e clientes
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);

  // Feedback popup
  const [popup, setPopup] = useState<{open: boolean, type?: any, title: string, message?: string}>({open: false, type: 'info', title: '', message: ''});

  const { user } = useAuth();
  const sendTelemetry = React.useCallback((area: string, action: string, meta?: Record<string, any>) => {
    logUiEvent({ userId: user?.id ?? null, page: 'entities', area, action, meta });
  }, [user?.id]);

  React.useEffect(() => {
    sendTelemetry('page', 'view');
  }, [sendTelemetry]);

  // tab change é logado no TabButton; mantemos apenas efeito de carregamento inicial

  // Carregar usuários/clientes reais ao abrir aba
  React.useEffect(() => {
        if (activeTab === 'suppliers') {
          setLoadingSuppliers(true);
          sendTelemetry('list', 'fetch-start', { entity: 'suppliers' });
          listSuppliers()
            .then(data => { setSuppliers(data); sendTelemetry('list', 'fetch-success', { entity: 'suppliers', count: data?.length || 0 }); })
            .catch(() => { setSuppliers([]); sendTelemetry('list', 'fetch-error', { entity: 'suppliers' }); })
            .finally(() => setLoadingSuppliers(false));
          listCategories()
            .then(data => { setCategories(data.items || []); sendTelemetry('list', 'fetch-success', { entity: 'categories', count: (data.items || []).length }); })
            .catch(() => { setCategories([]); sendTelemetry('list', 'fetch-error', { entity: 'categories' }); });
        }
    if (activeTab === 'users') {
      setLoadingUsers(true);
      sendTelemetry('list', 'fetch-start', { entity: 'users' });
      listUsers()
        .then(data => { setUsers(data); sendTelemetry('list', 'fetch-success', { entity: 'users', count: data?.length || 0 }); })
        .catch(() => { setUsers([]); sendTelemetry('list', 'fetch-error', { entity: 'users' }); })
        .finally(() => setLoadingUsers(false));
    }
    if (activeTab === 'clients') {
      setLoadingClients(true);
      sendTelemetry('list', 'fetch-start', { entity: 'clients' });
      listClients()
        .then(data => { setClients(data.items || data || []); sendTelemetry('list', 'fetch-success', { entity: 'clients', count: (data.items || data || []).length }); })
        .catch(() => { setClients([]); sendTelemetry('list', 'fetch-error', { entity: 'clients' }); })
        .finally(() => setLoadingClients(false));
    }
  }, [activeTab, isUserModalOpen, isClientModalOpen]);

  // Reset form when opening modal for new user
  React.useEffect(() => {
    if (isUserModalOpen && !editingItem) {
      setUserForm({
        name: '',
        email: '',
        role: 'operator',
        status: true,
        password: '',
        confirmPassword: ''
      });
    }
    if (isUserModalOpen && editingItem) {
      setUserForm({
        name: editingItem.name || '',
        email: editingItem.email || '',
        role: editingItem.role || 'operator',
        status: editingItem.status !== 'inactive',
        password: '',
        confirmPassword: ''
      });
    }
  }, [isUserModalOpen, editingItem]);

  // Filtering Logic
  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (activeTab === 'users') {
      return users.filter(u => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
    } else if (activeTab === 'clients') {
      return clients.filter(c => c.name.toLowerCase().includes(term) || c.cpf.includes(term));
    } else {
      return suppliers.filter(s => s.name.toLowerCase().includes(term) || s.cnpj.includes(term));
    }
  }, [activeTab, searchTerm, users, clients, suppliers]);

  const TabButton = ({ id, label, icon: Icon }: { id: EntityTab, label: string, icon: any }) => (
    <button 
      onClick={() => { setActiveTab(id); setSearchTerm(''); sendTelemetry('tab', 'change', { tab: id }); }}
      className={`flex items-center gap-3 px-6 py-4 border-b-2 transition-all duration-300 ${
        activeTab === id 
          ? 'border-accent text-accent bg-accent/5' 
          : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/2'
      }`}
    >
      <Icon size={18} />
      <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
    </button>
  );

  console.log('[DEBUG] Current user in Entities:', user);
  return (
    <div className="p-8 flex flex-col h-full overflow-hidden assemble-view bg-dark-950 bg-cyber-grid relative">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0 mb-8 relative z-10">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
             <Users className="text-accent" /> Gerenciamento de Entidades
          </h1>
          <p className="text-slate-500 text-sm font-medium">Controlador central de identidades e parceiros do ecossistema.</p>
        </div>
        {console.log('[DEBUG] Entities user:', user)}
        {user?.role !== 'operator' && (
          <div className="flex items-center gap-3">
            <Button 
              className="shadow-accent-glow"
              onClick={() => {
                if (activeTab === 'users') setIsUserModalOpen(true);
                if (activeTab === 'clients') setIsClientModalOpen(true);
                if (activeTab === 'suppliers') setIsSupplierModalOpen(true);
                setEditingItem(null);
                sendTelemetry('modal', 'open', { entity: activeTab, mode: 'create' });
              }} 
              icon={<Plus size={18} />}
            >
              Adicionar {activeTab === 'users' ? 'Usuário' : activeTab === 'clients' ? 'Cliente' : 'Fornecedor'}
            </Button>
          </div>
        )}
      </div>

      {/* Tabs & Filters Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between bg-dark-900/60 border border-white/5 rounded-2xl overflow-hidden mb-6 shrink-0 backdrop-blur-md relative z-10 shadow-xl animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex w-full md:w-auto overflow-x-auto">
          <TabButton id="users" label="Usuários" icon={Shield} />
          <TabButton id="clients" label="Clientes" icon={Users} />
          <TabButton id="suppliers" label="Fornecedores" icon={Truck} />
        </div>
        <div className="p-2 w-full md:w-80 px-4">
           <Input 
            placeholder={`Filtrar ${activeTab}...`} 
            value={searchTerm} 
            onChange={(e) => { const v = e.target.value; setSearchTerm(v); sendTelemetry('search', 'type', { tab: activeTab, length: v.length }); }}
            icon={<Search size={16} />}
            className="bg-transparent border-none py-2"
           />
        </div>
      </div>

      {/* Main Table Content */}
      <div className="flex-1 bg-dark-900/40 border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col min-h-0 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
       <div className="flex-1 min-h-0 max-h-[calc(100vh-160px)] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-dark-950/90 backdrop-blur-md z-20 border-b border-white/5">
              <tr className="text-slate-600 text-[10px] uppercase font-bold tracking-[0.2em]">
          {activeTab === 'users' && (
            <>
              <th className="px-8 py-5">Identidade</th>
              <th className="px-8 py-5">Acesso</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5">Último Login</th>
            </>
          )}
          {activeTab === 'clients' && (
            <>
              <th className="px-8 py-5">Cliente / CPF</th>
              <th className="px-8 py-5">Contato</th>
              <th className="px-8 py-5">Localização</th>
              <th className="px-8 py-5">Volume Gasto</th>
            </>
          )}
          {activeTab === 'suppliers' && (
            <>
              <th className="px-8 py-5">Razão / CNPJ</th>
              <th className="px-8 py-5">Categoria</th>
              <th className="px-8 py-5">Contato</th>
              <th className="px-8 py-5">Endereço</th>
            </>
          )}
          {/* Só mostra coluna de ações se usuário não for operador */}
          <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredData.filter((item: any) => item.id != null).map((item: any, idx: number) => (
          <tr key={item.id ?? `user-row-${idx}`} className="group hover:bg-white/5 transition-all cursor-default">
            {activeTab === 'users' && (
              <>
                <td className="px-8 py-5">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center font-bold text-accent shadow-accent-glow/20">
                  {item.name.charAt(0)}
               </div>
               <div>
                  <div className="text-sm font-bold text-slate-200 group-hover:text-accent transition-colors">{item.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono tracking-tight">{item.email}</div>
               </div>
            </div>
                </td>
                <td className="px-8 py-5">
             <Badge variant={item.role === 'admin' ? 'info' : 'success'}>{item.role}</Badge>
                </td>
                <td className="px-8 py-5">
             <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`} />
                <span className="text-[10px] font-bold uppercase text-slate-400">{item.status}</span>
             </div>
                </td>
                <td className="px-8 py-5 text-[10px] font-mono text-slate-600">
             {new Date(item.lastLogin).toLocaleString()}
                </td>
              </>
            )}

            {activeTab === 'clients' && (
              <>
                <td className="px-8 py-5">
            <div className="text-sm font-bold text-slate-200 group-hover:text-accent transition-colors">{item.name}</div>
            <div className="text-[10px] text-slate-500 font-mono tracking-tighter">{item.cpf}</div>
                </td>
                <td className="px-8 py-5 text-[10px] text-slate-400 space-y-1">
             <div className="flex items-center gap-2"><Mail size={12} className="text-accent/60" /> {item.email || 'N/A'}</div>
             <div className="flex items-center gap-2"><Phone size={12} className="text-accent/60" /> {item.phone}</div>
                </td>
                <td className="px-8 py-5 text-[10px] text-slate-500 truncate max-w-xs">
             <div className="flex items-center gap-2"><MapPin size={12} className="text-slate-600" /> {item.address}</div>
                </td>
                <td className="px-8 py-5 font-mono text-sm font-bold text-emerald-400">
             R$ {(item.totalSpent !== undefined && item.totalSpent !== null) ? (Number(item.totalSpent) / 100).toFixed(2) : '0.00'}
                </td>
              </>
            )}

            {activeTab === 'suppliers' && (
              <>
                <td className="px-8 py-5">
            <div className="text-sm font-bold text-slate-200 group-hover:text-accent transition-colors">{item.name}</div>
            <div className="text-[10px] text-slate-500 font-mono tracking-tighter">{item.cnpj}</div>
                </td>
                <td className="px-8 py-5">
             <Badge variant="info">{item.category}</Badge>
                </td>
                <td className="px-8 py-5 text-[10px] text-slate-400 space-y-1">
             <div className="flex items-center gap-2"><Mail size={12} className="text-accent/60" /> {item.email}</div>
             <div className="flex items-center gap-2"><Phone size={12} className="text-accent/60" /> {item.phone}</div>
                </td>
                <td className="px-8 py-5 text-[10px] text-slate-500 max-w-xs truncate">
             {item.address}
                </td>
              </>
            )}

            {/* Só mostra ações se usuário não for operador */}
            {user?.role !== 'operator' && (
              <td className="px-8 py-5 text-right">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => {
                      setEditingItem(item);
                      if (activeTab === 'users') setIsUserModalOpen(true);
                      if (activeTab === 'clients') setIsClientModalOpen(true);
                      if (activeTab === 'suppliers') setIsSupplierModalOpen(true);
                      sendTelemetry('modal', 'open', { entity: activeTab, mode: 'edit', id: item.id });
                    }}
                    className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-accent border border-white/5 transition-all hover:scale-110 active:scale-90"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-red-500 border border-white/5 transition-all hover:scale-110 active:scale-90"
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (activeTab === 'users') {
                        sendTelemetry('user', 'delete-start', { userId: item.id });
                        try {
                          await deleteUser(item.id);
                          setPopup({open: true, type: 'success', title: 'Usuário excluído', message: 'Usuário removido com sucesso!'});
                          setLoadingUsers(true);
                          const updated = await listUsers();
                          setUsers(updated);
                          sendTelemetry('user', 'delete-success', { userId: item.id });
                        } catch {
                          setPopup({open: true, type: 'error', title: 'Erro ao excluir usuário', message: 'Tente novamente.'});
                          sendTelemetry('user', 'delete-error', { userId: item.id });
                        }
                      }
                      if (activeTab === 'clients') {
                        sendTelemetry('client', 'delete-start', { clientId: item.id });
                        try {
                          await deleteClient(item.id);
                          setPopup({open: true, type: 'success', title: 'Cliente excluído', message: 'Cliente removido com sucesso!'});
                          setLoadingClients(true);
                          const updated = await listClients();
                          setClients(updated);
                          sendTelemetry('client', 'delete-success', { clientId: item.id });
                        } catch {
                          setPopup({open: true, type: 'error', title: 'Erro ao excluir cliente', message: 'Tente novamente.'});
                          sendTelemetry('client', 'delete-error', { clientId: item.id });
                        }
                      }
                      if (activeTab === 'suppliers') {
                        try {
                          console.log('[UI] Tentando excluir fornecedor id:', item.id);
                          sendTelemetry('supplier', 'delete-start', { supplierId: item.id });
                          const result = await deleteSupplier(item.id);
                          console.log('[UI] Resultado da exclusão:', result);
                          if (result && result.changes > 0) {
                            setPopup({open: true, type: 'success', title: 'Fornecedor excluído', message: 'Fornecedor removido com sucesso!'});
                            setLoadingSuppliers(true);
                            const updated = await listSuppliers();
                            console.log('[UI] Lista de fornecedores após exclusão:', updated);
                            setSuppliers(updated);
                            sendTelemetry('supplier', 'delete-success', { supplierId: item.id });
                          } else {
                            console.error('[UI] Erro: Exclusão não retornou changes > 0', result);
                            setPopup({open: true, type: 'error', title: 'Erro ao excluir fornecedor', message: 'Tente novamente.'});
                            sendTelemetry('supplier', 'delete-error', { supplierId: item.id, reason: 'no-changes' });
                          }
                        } catch (e) {
                          console.error('[UI] Catch erro ao excluir fornecedor:', e);
                          setPopup({open: true, type: 'error', title: 'Erro ao excluir fornecedor', message: 'Tente novamente.'});
                          sendTelemetry('supplier', 'delete-error', { supplierId: item.id, reason: 'exception' });
                        }
                      }
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            )}
          </tr>
              ))}
            </tbody>
          </table>
        </div>
            </div>

      {/* MODALS SECTION */}

      {/* User Modal */}
      <Modal isOpen={isUserModalOpen} onClose={() => { setIsUserModalOpen(false); sendTelemetry('modal', 'close', { entity: 'users', reason: 'overlay' }); }} title={editingItem ? "Sincronizar Operador" : "Vincular Novo Operador"}>
         <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
               <div className="col-span-2">
                 <Input 
                   label="Identificação Completa" 
                   value={userForm.name}
                   onChange={e => { const val = e.target.value; setUserForm(f => ({ ...f, name: val })); sendTelemetry('user', 'edit-field', { field: 'name', hasValue: !!val }); }}
                   className="bg-dark-950/50" 
                 />
               </div>
               <div className="col-span-2">
                 <Input 
                   label="E-mail de Acesso" 
                   type="email" 
                   value={userForm.email}
                   onChange={e => { const val = e.target.value; setUserForm(f => ({ ...f, email: val })); sendTelemetry('user', 'edit-field', { field: 'email', hasValue: !!val }); }}
                   icon={<Mail size={14} />} 
                   className="bg-dark-950/50" 
                 />
               </div>
               <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Célula de Acesso</label>
                  <select 
                    className="w-full bg-dark-950/50 border border-white/5 rounded-lg py-2.5 px-4 text-slate-100 outline-none text-sm focus:border-accent transition-all" 
                    value={userForm.role}
                    onChange={e => { const role = e.target.value; setUserForm(f => ({ ...f, role })); sendTelemetry('user', 'change-role', { role }); }}
                  >
                    <option value="operator">Operador</option>
                    <option value="manager">Gerente</option>
                    <option value="admin">Administrador</option>
                  </select>
               </div>
               <div className="flex items-end pb-3">
                  <Switch 
                    label="Credencial Ativa" 
                    enabled={userForm.status}
                    onChange={val => { setUserForm(f => ({ ...f, status: val })); sendTelemetry('user', 'toggle-status', { value: val }); }} 
                  />
               </div>
               {!editingItem && (
                 <>
                     <Input 
                       label="Código de Acesso" 
                       type="password" 
                       value={userForm.password}
                       onChange={e => { const val = e.target.value; setUserForm(f => ({ ...f, password: val })); sendTelemetry('user', 'edit-field', { field: 'password', hasValue: !!val }); }}
                     />
                   <Input 
                     label="Confirmar Código" 
                     type="password" 
                       value={userForm.confirmPassword}
                       onChange={e => { const val = e.target.value; setUserForm(f => ({ ...f, confirmPassword: val })); sendTelemetry('user', 'edit-field', { field: 'confirmPassword', hasValue: !!val }); }}
                   />
                 </>
               )}
            </div>
            <div className="flex gap-4 pt-4">
               <Button variant="secondary" className="flex-1" onClick={() => { setIsUserModalOpen(false); sendTelemetry('modal', 'close', { entity: 'users', reason: 'cancel' }); }}>Abortar</Button>
               <Button className="flex-1 shadow-accent-glow" onClick={async () => {
                 // Validação básica
                 if (!userForm.name || !userForm.email || !userForm.role || (!editingItem && (!userForm.password || userForm.password !== userForm.confirmPassword))) {
                   setPopup({open: true, type: 'error', title: 'Preencha todos os campos corretamente', message: 'Verifique os dados e tente novamente.'});
                   return;
                 }
                 try {
                   sendTelemetry('user', 'submit-start', { mode: editingItem ? 'update' : 'create', userId: editingItem?.id || null });
                   if (editingItem) {
                     await updateUser(editingItem.id, {
                       name: userForm.name,
                       email: userForm.email,
                       role: userForm.role,
                       status: userForm.status
                     });
                     setPopup({open: true, type: 'success', title: 'Usuário atualizado', message: 'Dados do operador atualizados!'});
                     sendTelemetry('user', 'submit-success', { mode: 'update', userId: editingItem.id, role: userForm.role, status: userForm.status });
                   } else {
                     await createUser({
                       name: userForm.name,
                       email: userForm.email,
                       role: userForm.role,
                       status: userForm.status,
                       password: userForm.password
                     });
                     setPopup({open: true, type: 'success', title: 'Usuário criado', message: 'Novo operador vinculado com sucesso!'});
                     sendTelemetry('user', 'submit-success', { mode: 'create', email: userForm.email, role: userForm.role, status: userForm.status });
                   }
                   setIsUserModalOpen(false);
                   // Atualiza lista
                   setLoadingUsers(true);
                   const updated = await listUsers();
                   setUsers(updated);
                 } catch (e) {
                   setPopup({open: true, type: 'error', title: editingItem ? 'Erro ao atualizar usuário' : 'Erro ao criar usuário', message: 'Tente novamente.'});
                   sendTelemetry('user', 'submit-error', { mode: editingItem ? 'update' : 'create', userId: editingItem?.id || null });
                 }
               }}>Confirmar Vínculo</Button>
            </div>
         </div>
      </Modal>

      {/* Feedback Popup */}
      <FeedbackPopup 
        open={popup.open} 
        type={popup.type} 
        title={popup.title} 
        message={popup.message} 
        onClose={() => setPopup(p => ({...p, open: false}))} 
      />

      {/* Client Modal */}
      <Modal isOpen={isClientModalOpen} onClose={() => { setIsClientModalOpen(false); setEditingItem(null); sendTelemetry('modal', 'close', { entity: 'clients', reason: 'overlay' }); }} title={editingItem ? "Ficha do Consumidor" : "Indexar Novo Consumidor"}>
        <div className="space-y-6">
          <Input label="Nome Completo / Social" value={editingItem?.name ?? ''} onChange={e => { const val = e.target.value; setEditingItem((prev: any) => ({ ...prev, name: val })); sendTelemetry('client', 'edit-field', { field: 'name', hasValue: !!val }); }} className="bg-dark-950/50" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="CPF / CNPJ" value={editingItem?.cpf ?? ''} onChange={e => { const val = e.target.value; setEditingItem((prev: any) => ({ ...prev, cpf: val })); sendTelemetry('client', 'edit-field', { field: 'cpf', hasValue: !!val }); }} className="bg-dark-950/50" />
            <Input label="Linha Direta" value={editingItem?.phone ?? ''} icon={<Phone size={14} />} onChange={e => { const val = e.target.value; setEditingItem((prev: any) => ({ ...prev, phone: val })); sendTelemetry('client', 'edit-field', { field: 'phone', hasValue: !!val }); }} className="bg-dark-950/50" />
          </div>
          <Input label="Canal Digital" type="email" value={editingItem?.email ?? ''} icon={<Mail size={14} />} onChange={e => { const val = e.target.value; setEditingItem((prev: any) => ({ ...prev, email: val })); sendTelemetry('client', 'edit-field', { field: 'email', hasValue: !!val }); }} className="bg-dark-950/50" />
          <Input label="Coordenadas de Entrega" value={editingItem?.address ?? ''} icon={<MapPin size={14} />} onChange={e => { const val = e.target.value; setEditingItem((prev: any) => ({ ...prev, address: val })); sendTelemetry('client', 'edit-field', { field: 'address', hasValue: !!val }); }} className="bg-dark-950/50" />
          <div className="flex gap-4 pt-4">
            <Button variant="secondary" className="flex-1" onClick={() => { setIsClientModalOpen(false); setEditingItem(null); sendTelemetry('modal', 'close', { entity: 'clients', reason: 'cancel' }); }}>Retornar</Button>
            <Button className="flex-1 shadow-accent-glow" onClick={async () => {
              if (!editingItem?.name || !editingItem?.cpf) {
               setPopup({open: true, type: 'error', title: 'Preencha todos os campos obrigatórios', message: 'Nome e CPF/CNPJ são obrigatórios.'});
               return;
              }
              try {
               sendTelemetry('client', 'submit-start', { mode: editingItem?.id ? 'update' : 'create', clientId: editingItem?.id || null });
               if (editingItem?.id) {
                await updateClient(editingItem.id, editingItem);
                setPopup({open: true, type: 'success', title: 'Cliente atualizado', message: 'Dados do cliente atualizados!'});
                sendTelemetry('client', 'submit-success', { mode: 'update', clientId: editingItem.id });
               } else {
                await createClient(editingItem);
                setPopup({open: true, type: 'success', title: 'Cliente criado', message: 'Novo cliente cadastrado!'});
                sendTelemetry('client', 'submit-success', { mode: 'create', name: editingItem?.name || '' });
               }
               setIsClientModalOpen(false);
               setEditingItem(null);
               setLoadingClients(true);
               const updated = await listClients();
               setClients(updated);
              } catch (e) {
               setPopup({open: true, type: 'error', title: editingItem?.id ? 'Erro ao atualizar cliente' : 'Erro ao criar cliente', message: 'Tente novamente.'});
               sendTelemetry('client', 'submit-error', { mode: editingItem?.id ? 'update' : 'create', clientId: editingItem?.id || null });
              }
            }}>Efetuar Registro</Button>
          </div>
        </div>
      </Modal>

      {/* Supplier Modal */}
      <Modal isOpen={isSupplierModalOpen} onClose={() => { setIsSupplierModalOpen(false); setEditingItem(null); sendTelemetry('modal', 'close', { entity: 'suppliers', reason: 'overlay' }); }} title={editingItem ? "Ativo Logístico" : "Homologar Fornecedor"}>
        <div className="space-y-6">
          <Input label="Corporação (Fantasia)" value={editingItem?.name ?? ''} onChange={e => { const val = e.target.value; setEditingItem((prev: any) => ({ ...prev, name: val })); sendTelemetry('supplier', 'edit-field', { field: 'name', hasValue: !!val }); }} className="bg-dark-950/50" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Registro CNPJ" value={editingItem?.cnpj ?? ''} onChange={e => { const val = e.target.value; setEditingItem((prev: any) => ({ ...prev, cnpj: val })); sendTelemetry('supplier', 'edit-field', { field: 'cnpj', hasValue: !!val }); }} className="bg-dark-950/50" />
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">Especialidade</label>
              <select className="w-full bg-dark-950/50 border border-white/5 rounded-lg py-2.5 px-4 text-slate-100 outline-none text-sm focus:border-accent" value={editingItem?.category ?? ''} onChange={e => { const val = e.target.value; setEditingItem((prev: any) => ({ ...prev, category: val })); sendTelemetry('supplier', 'change-category', { category: val }); }}>
                {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="E-mail Corporativo" value={editingItem?.email ?? ''} onChange={e => { const val = e.target.value; setEditingItem((prev: any) => ({ ...prev, email: val })); sendTelemetry('supplier', 'edit-field', { field: 'email', hasValue: !!val }); }} className="bg-dark-950/50" />
            <Input label="Suporte Vendas" value={editingItem?.phone ?? ''} onChange={e => { const val = e.target.value; setEditingItem((prev: any) => ({ ...prev, phone: val })); sendTelemetry('supplier', 'edit-field', { field: 'phone', hasValue: !!val }); }} className="bg-dark-950/50" />
          </div>
          <Input label="Centro de Distribuição" value={editingItem?.address ?? ''} icon={<MapPin size={14} />} onChange={e => { const val = e.target.value; setEditingItem((prev: any) => ({ ...prev, address: val })); sendTelemetry('supplier', 'edit-field', { field: 'address', hasValue: !!val }); }} className="bg-dark-950/50" />
          <div className="flex gap-4 pt-4">
            <Button variant="secondary" className="flex-1" onClick={() => { setIsSupplierModalOpen(false); setEditingItem(null); sendTelemetry('modal', 'close', { entity: 'suppliers', reason: 'cancel' }); }}>Descartar</Button>
            <Button className="flex-1 shadow-accent-glow" onClick={async () => {
              // Nome é o único campo obrigatório segundo o schema; demais são opcionais
              if (!editingItem?.name) {
               setPopup({open: true, type: 'error', title: 'Nome obrigatório', message: 'Informe pelo menos o nome do fornecedor.'});
               return;
              }
              try {
               sendTelemetry('supplier', 'submit-start', { mode: editingItem?.id ? 'update' : 'create', supplierId: editingItem?.id || null });
               if (editingItem?.id) {
                await updateSupplier(editingItem.id, editingItem);
                setPopup({open: true, type: 'success', title: 'Fornecedor atualizado', message: 'Dados do fornecedor atualizados!'});
                sendTelemetry('supplier', 'submit-success', { mode: 'update', supplierId: editingItem.id });
               } else {
                await createSupplier(editingItem);
                setPopup({open: true, type: 'success', title: 'Fornecedor criado', message: 'Novo fornecedor cadastrado!'});
                sendTelemetry('supplier', 'submit-success', { mode: 'create', name: editingItem?.name || '' });
               }
               setIsSupplierModalOpen(false);
               setEditingItem(null);
               setLoadingSuppliers(true);
               const updated = await listSuppliers();
               setSuppliers(updated);
              } catch (e) {
               setPopup({open: true, type: 'error', title: editingItem?.id ? 'Erro ao atualizar fornecedor' : 'Erro ao criar fornecedor', message: 'Tente novamente.'});
               sendTelemetry('supplier', 'submit-error', { mode: editingItem?.id ? 'update' : 'create', supplierId: editingItem?.id || null });
              }
            }}>Salvar Cadastro</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Entities;
