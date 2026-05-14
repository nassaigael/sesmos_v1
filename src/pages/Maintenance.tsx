import React, { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/Layout/Header';
import { Wrench, Clock, CheckCircle, XCircle, Edit, Trash2, X, Save, Calendar } from 'lucide-react';
import maintenanceApi from '../api/maintenanceApi';
import type { Maintenance, MaintenanceRequest, MaintenanceStatus } from '../types/maintenance.types';

interface LayoutContext {
    toggleSidebar: () => void;
    sidebarOpen: boolean;
    isMobile: boolean;
}

const COLORS = {
    primary: '#1A3C5E', warning: '#FFC107', danger: '#DC3545',
    success: '#28A745', info: '#17A2B8', border: 'rgba(26, 60, 94, 0.1)',
};

const STATUS_CONFIG: Record<MaintenanceStatus, { label: string; color: string; icon: React.ReactNode }> = {
    PLANIFIE: { label: 'Planifié', color: COLORS.info, icon: <Calendar className="w-4 h-4" /> },
    EN_COURS: { label: 'En cours', color: COLORS.warning, icon: <Clock className="w-4 h-4" /> },
    TERMINE: { label: 'Terminé', color: COLORS.success, icon: <CheckCircle className="w-4 h-4" /> },
    ANNULE: { label: 'Annulé', color: COLORS.danger, icon: <XCircle className="w-4 h-4" /> },
};

const EMPTY_FORM: MaintenanceRequest = {
    type: '', description: '', status: 'PLANIFIE',
    startDate: new Date().toISOString().slice(0, 16),
    endDate: '', equipmentId: '', technicianId: ''
};

const Maintenance: React.FC = () => {
    const { toggleSidebar, sidebarOpen, isMobile } = useOutletContext<LayoutContext>();
    const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<MaintenanceStatus | 'ALL'>('ALL');
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState<Maintenance | null>(null);
    const [form, setForm] = useState<MaintenanceRequest>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await maintenanceApi.getAll();
            setMaintenances(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const openCreate = () => { setEditItem(null); setForm(EMPTY_FORM); setFormError(null); setShowForm(true); };
    const openEdit = (m: Maintenance) => {
        setEditItem(m);
        setForm({
            type: m.type, description: m.description, status: m.status,
            startDate: m.startDate ? m.startDate.slice(0, 16) : '',
            endDate: m.endDate ? m.endDate.slice(0, 16) : '',
            equipmentId: m.equipment?.id || '', technicianId: m.technician?.id || ''
        });
        setFormError(null);
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!form.type.trim() || !form.equipmentId.trim()) { setFormError('Type et équipement sont requis.'); return; }
        setSaving(true); setFormError(null);
        try {
            if (editItem) await maintenanceApi.update(editItem.id, form);
            else await maintenanceApi.create(form);
            setShowForm(false);
            load();
        } catch (e: any) {
            setFormError(e?.response?.data?.message || 'Erreur lors de l\'enregistrement');
        } finally { setSaving(false); }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Supprimer cette maintenance ?')) return;
        try { await maintenanceApi.delete(id); load(); }
        catch { alert('Erreur lors de la suppression'); }
    };

    const handleStatusChange = async (id: string, status: MaintenanceStatus) => {
        try { await maintenanceApi.updateStatus(id, status); load(); }
        catch { alert('Erreur lors du changement de statut'); }
    };

    const filtered = maintenances.filter(m => {
        const match = (m.type + m.description + (m.equipment?.name || '')).toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = filterStatus === 'ALL' || m.status === filterStatus;
        return match && matchStatus;
    });

    const counts: Record<string, number> = { ALL: maintenances.length };
    maintenances.forEach(m => { counts[m.status] = (counts[m.status] || 0) + 1; });

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
            <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} isMobile={isMobile}
                currentPage="maintenance" onAdd={openCreate} onSearch={setSearchTerm}
                showAddButton={true} showSearch={true} totalCount={filtered.length} />

            <div className="p-4 md:p-6">
                {/* KPI */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
                    <button onClick={() => setFilterStatus('ALL')}
                        className="bg-white rounded-2xl p-4 shadow-sm border text-left hover:shadow-md transition-all col-span-1"
                        style={{ borderColor: filterStatus === 'ALL' ? COLORS.primary : COLORS.border, borderWidth: filterStatus === 'ALL' ? 2 : 1 }}>
                        <p className="text-2xl font-bold" style={{ color: COLORS.primary }}>{maintenances.length}</p>
                        <p className="text-xs mt-1" style={{ color: COLORS.primary, opacity: 0.6 }}>Total</p>
                    </button>
                    {(Object.entries(STATUS_CONFIG) as [MaintenanceStatus, typeof STATUS_CONFIG[MaintenanceStatus]][]).map(([k, v]) => (
                        <button key={k} onClick={() => setFilterStatus(k)}
                            className="bg-white rounded-2xl p-4 shadow-sm border text-left hover:shadow-md transition-all"
                            style={{ borderColor: filterStatus === k ? v.color : COLORS.border, borderWidth: filterStatus === k ? 2 : 1 }}>
                            <p className="text-2xl font-bold" style={{ color: v.color }}>{counts[k] || 0}</p>
                            <p className="text-xs mt-1" style={{ color: COLORS.primary, opacity: 0.6 }}>{v.label}</p>
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: COLORS.border }}>
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: COLORS.primary }} />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="p-8 text-center">
                            <Wrench className="w-12 h-12 mx-auto mb-3" style={{ color: COLORS.primary, opacity: 0.2 }} />
                            <p style={{ color: COLORS.primary, opacity: 0.5 }}>Aucune maintenance trouvée</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr style={{ backgroundColor: `${COLORS.primary}08` }}>
                                        {['Type', 'Équipement', 'Technicien', 'Début', 'Fin', 'Statut', 'Actions'].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: COLORS.primary, opacity: 0.7 }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((m, i) => {
                                        const sc = STATUS_CONFIG[m.status];
                                        return (
                                            <tr key={m.id} className="border-t hover:bg-gray-50 transition-colors"
                                                style={{ borderColor: COLORS.border, backgroundColor: i % 2 === 0 ? 'white' : `${COLORS.primary}02` }}>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${sc.color}15`, color: sc.color }}>
                                                            <Wrench className="w-3.5 h-3.5" />
                                                        </div>
                                                        <span className="font-medium text-sm" style={{ color: COLORS.primary }}>{m.type}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm" style={{ color: COLORS.primary, opacity: 0.8 }}>
                                                    {m.equipment?.name || '—'}
                                                    {m.equipment?.serialNumber && (
                                                        <div className="text-xs opacity-60 font-mono">{m.equipment.serialNumber}</div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm" style={{ color: COLORS.primary, opacity: 0.7 }}>
                                                    {m.technician ? `${m.technician.firstName} ${m.technician.lastName}` : '—'}
                                                </td>
                                                <td className="px-4 py-3 text-xs" style={{ color: COLORS.primary, opacity: 0.6 }}>
                                                    {m.startDate ? new Date(m.startDate).toLocaleDateString('fr-FR') : '—'}
                                                </td>
                                                <td className="px-4 py-3 text-xs" style={{ color: COLORS.primary, opacity: 0.6 }}>
                                                    {m.endDate ? new Date(m.endDate).toLocaleDateString('fr-FR') : '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <select value={m.status}
                                                        onChange={e => handleStatusChange(m.id, e.target.value as MaintenanceStatus)}
                                                        className="text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer"
                                                        style={{ backgroundColor: `${sc.color}15`, color: sc.color }}>
                                                        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                                            <option key={k} value={k}>{v.label}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-1">
                                                        <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg hover:bg-blue-50" style={{ color: COLORS.primary }}>
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-lg hover:bg-red-50" style={{ color: COLORS.danger }}>
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal formulaire */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white" style={{ borderColor: COLORS.border }}>
                            <h3 className="font-bold text-base" style={{ color: COLORS.primary }}>
                                {editItem ? 'Modifier la maintenance' : 'Nouvelle maintenance'}
                            </h3>
                            <button onClick={() => setShowForm(false)} style={{ color: COLORS.primary, opacity: 0.5 }}><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            {formError && (
                                <div className="p-3 rounded-xl text-sm" style={{ backgroundColor: `${COLORS.danger}10`, color: COLORS.danger }}>{formError}</div>
                            )}
                            <div>
                                <label className="block text-xs font-medium mb-1" style={{ color: COLORS.primary, opacity: 0.7 }}>Type *</label>
                                <input type="text" value={form.type} placeholder="Préventive, corrective..."
                                    onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                                    className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none" style={{ borderColor: COLORS.border }} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1" style={{ color: COLORS.primary, opacity: 0.7 }}>ID Équipement *</label>
                                <input type="text" value={form.equipmentId} placeholder="ID de l'équipement"
                                    onChange={e => setForm(p => ({ ...p, equipmentId: e.target.value }))}
                                    className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none" style={{ borderColor: COLORS.border }} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1" style={{ color: COLORS.primary, opacity: 0.7 }}>Description</label>
                                <textarea value={form.description} rows={3}
                                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                    className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none resize-none" style={{ borderColor: COLORS.border }} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1" style={{ color: COLORS.primary, opacity: 0.7 }}>Statut</label>
                                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as MaintenanceStatus }))}
                                    className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none bg-white" style={{ borderColor: COLORS.border }}>
                                    {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium mb-1" style={{ color: COLORS.primary, opacity: 0.7 }}>Date début</label>
                                    <input type="datetime-local" value={form.startDate}
                                        onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                                        className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none" style={{ borderColor: COLORS.border }} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1" style={{ color: COLORS.primary, opacity: 0.7 }}>Date fin</label>
                                    <input type="datetime-local" value={form.endDate || ''}
                                        onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                                        className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none" style={{ borderColor: COLORS.border }} />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 px-6 pb-6">
                            <button onClick={() => setShowForm(false)}
                                className="flex-1 px-4 py-2 rounded-xl border text-sm" style={{ borderColor: COLORS.border, color: COLORS.primary }}>
                                Annuler
                            </button>
                            <button onClick={handleSave} disabled={saving}
                                className="flex-1 px-4 py-2 rounded-xl text-sm text-white font-medium flex items-center justify-center gap-2 disabled:opacity-60"
                                style={{ backgroundColor: COLORS.primary }}>
                                <Save className="w-4 h-4" />
                                {saving ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Maintenance;