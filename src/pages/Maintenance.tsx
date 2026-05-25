import React, { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/Layout/Header';
import MaintenanceList from '../components/maintenance/MaintenanceList';
import MaintenanceCard from '../components/maintenance/MaintenanceCard';
import MaintenanceDetail from '../components/maintenance/MaintenanceDetail';
import { Wrench, X, Save, AlertTriangle } from 'lucide-react';
import maintenanceApi from '../api/Maintenanceapi';
import type { Maintenance, MaintenanceRequest, MaintenanceStatus } from '../types/Maintenance.types';

interface LayoutContext {
    toggleSidebar: () => void;
    sidebarOpen: boolean;
    isMobile: boolean;
}

type ViewMode = 'list' | 'grid';

const COLORS = {
    primary: '#1A3C5E',
    primaryLight: '#2A5C8E',
    warning: '#FFC107',
    danger: '#DC3545',
    success: '#10B981',
    border: 'rgba(26, 60, 94, 0.1)',
    borderLight: 'rgba(26, 60, 94, 0.05)',
    background: '#F5F7FA',
    white: '#FFFFFF'
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
    PENDING: { label: 'En attente', color: COLORS.warning, bgColor: `${COLORS.warning}15` },
    IN_PROGRESS: { label: 'En cours', color: COLORS.primary, bgColor: `${COLORS.primary}10` },
    COMPLETED: { label: 'Terminé', color: COLORS.success, bgColor: `${COLORS.success}15` },
    CANCELLED: { label: 'Annulé', color: COLORS.danger, bgColor: `${COLORS.danger}10` },
};

const EMPTY_FORM: MaintenanceRequest = {
    type: '',
    description: '',
    status: 'PENDING',
    startDate: new Date().toISOString().slice(0, 16),
    endDate: '',
    equipmentId: '',
    technicianId: ''
};

const SkeletonCard: React.FC = () => (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
        <div className="h-24" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)` }} />
        <div className="relative flex justify-center -mt-12">
            <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white shadow-lg" />
        </div>
        <div className="p-4 pt-6">
            <div className="text-center mb-3">
                <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
            <div className="space-y-2 mb-4">
                <div className="h-10 bg-gray-200 rounded-lg"></div>
                <div className="h-10 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="flex gap-2 pt-2">
                <div className="flex-1 h-9 bg-gray-200 rounded-xl"></div>
                <div className="flex-1 h-9 bg-gray-200 rounded-xl"></div>
            </div>
        </div>
    </div>
);

const SkeletonRow: React.FC = () => (
    <div className="border-t animate-pulse" style={{ borderColor: COLORS.border }}>
        <div className="px-4 py-3">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-200" />
                <div className="h-4 bg-gray-200 rounded w-32" />
            </div>
        </div>
    </div>
);

const Maintenance: React.FC = () => {
    const { toggleSidebar, sidebarOpen, isMobile } = useOutletContext<LayoutContext>();
    const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<MaintenanceStatus | 'ALL'>('ALL');
    const [showForm, setShowForm] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedMaintenance, setSelectedMaintenance] = useState<Maintenance | null>(null);
    const [editItem, setEditItem] = useState<Maintenance | null>(null);
    const [form, setForm] = useState<MaintenanceRequest>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [equipments, setEquipments] = useState<any[]>([]);
    const [technicians, setTechnicians] = useState<any[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        const saved = localStorage.getItem('maintenanceViewMode');
        return (saved === 'list' || saved === 'grid') ? saved : 'list';
    });

    const loadEquipmentsAndTechnicians = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const [equipmentsRes, usersRes] = await Promise.all([
                fetch('/api/v1/equipment', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }).then(res => res.json()),
                fetch('/api/v1/users/filter?role=TECHNICIAN', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }).then(res => res.json())
            ]);
            setEquipments(equipmentsRes.content || equipmentsRes || []);
            setTechnicians(usersRes.content || usersRes || []);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }, []);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await maintenanceApi.getAll();
            setMaintenances(data);
            await loadEquipmentsAndTechnicians();
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [loadEquipmentsAndTechnicians]);

    useEffect(() => { load(); }, [load]);

    const handleViewModeChange = (mode: ViewMode) => {
        setViewMode(mode);
        localStorage.setItem('maintenanceViewMode', mode);
    };

    const openCreate = () => {
        setEditItem(null);
        setForm({ ...EMPTY_FORM, startDate: new Date().toISOString().slice(0, 16) });
        setFormError(null);
        setShowForm(true);
    };

    const openEdit = (m: Maintenance) => {
        setEditItem(m);
        setForm({
            type: m.type,
            description: m.description || '',
            status: m.status,
            startDate: m.startDate ? m.startDate.slice(0, 16) : '',
            endDate: m.endDate ? m.endDate.slice(0, 16) : '',
            equipmentId: m.equipment?.id || '',
            technicianId: m.technician?.id || ''
        });
        setFormError(null);
        setShowForm(true);
    };

    const handleViewDetails = (maintenance: Maintenance) => {
        setSelectedMaintenance(maintenance);
        setShowDetail(true);
    };

    const handleSave = async () => {
        if (!form.type.trim()) {
            setFormError('Le type est requis.');
            return;
        }
        if (!form.equipmentId) {
            setFormError('L\'équipement est requis.');
            return;
        }
        setSaving(true);
        setFormError(null);
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
        try {
            await maintenanceApi.delete(id);
            load();
        } catch {
            alert('Erreur lors de la suppression');
        }
    };

    const filtered = maintenances.filter(m => {
        const match = (m.type + m.description + (m.equipment?.name || '')).toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = filterStatus === 'ALL' || m.status === filterStatus;
        return match && matchStatus;
    });

    const counts: Record<string, number> = { ALL: maintenances.length };
    maintenances.forEach(m => { counts[m.status] = (counts[m.status] || 0) + 1; });

    if (loading && maintenances.length === 0) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: COLORS.background }}>
                <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} isMobile={isMobile}
                    currentPage="maintenance" onAdd={openCreate} onSearch={setSearchTerm}
                    showAddButton={true} showSearch={true} totalCount={0} />
                <div className="p-4 md:p-6">
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: COLORS.border }}>
                            {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const emptyState = (
        <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.borderLight }}>
                <Wrench className="w-8 h-8" style={{ color: COLORS.primary, opacity: 0.3 }} />
            </div>
            <h3 className="text-lg font-semibold mb-1" style={{ color: COLORS.primary }}>
                {searchTerm ? 'Aucun résultat trouvé' : 'Aucune maintenance'}
            </h3>
            <p className="text-sm" style={{ color: COLORS.primary, opacity: 0.5 }}>
                {searchTerm
                    ? `Aucune maintenance ne correspond à "${searchTerm}"`
                    : 'Aucune intervention de maintenance n\'est enregistrée'}
            </p>
        </div>
    );

    return (
        <div className="min-h-screen" style={{ backgroundColor: COLORS.background }}>
            <Header
                toggleSidebar={toggleSidebar}
                sidebarOpen={sidebarOpen}
                isMobile={isMobile}
                currentPage="maintenance"
                onAdd={openCreate}
                onSearch={setSearchTerm}
                onViewModeToggle={() => handleViewModeChange(viewMode === 'list' ? 'grid' : 'list')}
                showAddButton={true}
                showSearch={true}
                showViewToggle={true}
                viewMode={viewMode}
                totalCount={filtered.length}
            />

            <div className="p-4 md:p-6">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
                    <button onClick={() => setFilterStatus('ALL')}
                        className="bg-white rounded-2xl p-4 shadow-sm border text-left hover:shadow-md transition-all"
                        style={{
                            borderColor: filterStatus === 'ALL' ? COLORS.primary : COLORS.border,
                            borderWidth: filterStatus === 'ALL' ? 2 : 1
                        }}>
                        <p className="text-2xl font-bold" style={{ color: COLORS.primary }}>{maintenances.length}</p>
                        <p className="text-xs mt-1" style={{ color: COLORS.primary, opacity: 0.6 }}>Total</p>
                    </button>
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                        <button key={k} onClick={() => setFilterStatus(k as MaintenanceStatus)}
                            className="bg-white rounded-2xl p-4 shadow-sm border text-left hover:shadow-md transition-all"
                            style={{
                                borderColor: filterStatus === k ? v.color : COLORS.border,
                                borderWidth: filterStatus === k ? 2 : 1
                            }}>
                            <p className="text-2xl font-bold" style={{ color: v.color }}>{counts[k] || 0}</p>
                            <p className="text-xs mt-1" style={{ color: COLORS.primary, opacity: 0.6 }}>{v.label}</p>
                        </button>
                    ))}
                </div>

                {searchTerm && !loading && filtered.length > 0 && (
                    <div className="mb-4 text-sm" style={{ color: COLORS.primary, opacity: 0.6 }}>
                        {filtered.length} résultat{filtered.length > 1 ? 's' : ''} pour "{searchTerm}"
                    </div>
                )}

                {loading ? (
                    viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: COLORS.border }}>
                            {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
                        </div>
                    )
                ) : filtered.length === 0 ? (
                    emptyState
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filtered.map((maintenance) => (
                            <MaintenanceCard
                                key={maintenance.id}
                                maintenance={maintenance}
                                onEdit={openEdit}
                                onDelete={handleDelete}
                                onViewDetails={handleViewDetails}
                            />
                        ))}
                    </div>
                ) : (
                    <MaintenanceList
                        maintenances={filtered}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                    />
                )}
            </div>

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
                    <div className="fixed inset-0 backdrop-blur-sm transition-all duration-300" style={{ backgroundColor: 'rgba(26, 60, 94, 0.3)' }} onClick={() => setShowForm(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all duration-300">
                        <div className="sticky top-0 z-10" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)` }}>
                            <div className="px-5 pt-5 pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.warning }}>
                                            <Wrench className="w-3.5 h-3.5" style={{ color: COLORS.primary }} />
                                        </div>
                                        <div>
                                            <h2 className="text-white font-bold text-base">
                                                {editItem ? 'Modifier la maintenance' : 'Nouvelle maintenance'}
                                            </h2>
                                            <p className="text-white/60 text-xs">
                                                {editItem ? 'Modifier une intervention' : 'Planifier une intervention'}
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowForm(false)} className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all flex items-center justify-center">
                                        <X className="w-3.5 h-3.5 text-white" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 space-y-4">
                            {formError && (
                                <div className="p-2.5 rounded-xl flex items-center gap-2 text-sm" style={{ backgroundColor: `${COLORS.danger}10`, color: COLORS.danger }}>
                                    <AlertTriangle className="w-4 h-4" />
                                    <span>{formError}</span>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.primary }}>
                                    Type <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.type}
                                    onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                                    className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all"
                                    style={{ borderColor: COLORS.border }}
                                    onFocus={e => e.target.style.borderColor = COLORS.warning}
                                    onBlur={e => e.target.style.borderColor = COLORS.border}
                                    placeholder="Ex: Préventive, Corrective, Inspection"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.primary }}>
                                    Équipement <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Wrench className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: COLORS.primary, opacity: 0.4 }} />
                                    <select
                                        value={form.equipmentId}
                                        onChange={e => setForm(p => ({ ...p, equipmentId: e.target.value }))}
                                        className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all appearance-none bg-white"
                                        style={{ borderColor: COLORS.border }}
                                        onFocus={e => e.target.style.borderColor = COLORS.warning}
                                        onBlur={e => e.target.style.borderColor = COLORS.border}
                                    >
                                        <option value="">Sélectionner un équipement</option>
                                        {equipments.map(eq => (
                                            <option key={eq.id} value={eq.id}>{eq.name} - {eq.serialNumber}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.primary }}>
                                    Technicien
                                </label>
                                <select
                                    value={form.technicianId}
                                    onChange={e => setForm(p => ({ ...p, technicianId: e.target.value }))}
                                    className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all bg-white"
                                    style={{ borderColor: COLORS.border }}
                                    onFocus={e => e.target.style.borderColor = COLORS.warning}
                                    onBlur={e => e.target.style.borderColor = COLORS.border}
                                >
                                    <option value="">Non assigné</option>
                                    {technicians.map(tech => (
                                        <option key={tech.id} value={tech.id}>{tech.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.primary }}>
                                    Description
                                </label>
                                <textarea
                                    value={form.description}
                                    rows={3}
                                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                    className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all resize-none"
                                    style={{ borderColor: COLORS.border }}
                                    onFocus={e => e.target.style.borderColor = COLORS.warning}
                                    onBlur={e => e.target.style.borderColor = COLORS.border}
                                    placeholder="Description détaillée de l'intervention..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.primary }}>
                                    Statut
                                </label>
                                <select
                                    value={form.status}
                                    onChange={e => setForm(p => ({ ...p, status: e.target.value as MaintenanceStatus }))}
                                    className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all bg-white"
                                    style={{ borderColor: COLORS.border }}
                                    onFocus={e => e.target.style.borderColor = COLORS.warning}
                                    onBlur={e => e.target.style.borderColor = COLORS.border}
                                >
                                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                        <option key={k} value={k}>{v.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.primary }}>
                                        Date début
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={form.startDate}
                                        onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                                        className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all"
                                        style={{ borderColor: COLORS.border }}
                                        onFocus={e => e.target.style.borderColor = COLORS.warning}
                                        onBlur={e => e.target.style.borderColor = COLORS.border}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1" style={{ color: COLORS.primary }}>
                                        Date fin
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={form.endDate}
                                        onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                                        className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all"
                                        style={{ borderColor: COLORS.border }}
                                        onFocus={e => e.target.style.borderColor = COLORS.warning}
                                        onBlur={e => e.target.style.borderColor = COLORS.border}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 px-5 pb-5">
                            <button
                                onClick={() => setShowForm(false)}
                                className="flex-1 px-3 py-2 rounded-xl border transition-all text-sm font-medium hover:bg-gray-50"
                                style={{ borderColor: COLORS.border, color: COLORS.primary }}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-white transition-all hover:opacity-90 disabled:opacity-50 text-sm font-medium"
                                style={{ backgroundColor: COLORS.primary }}
                            >
                                <Save className="w-4 h-4" />
                                {saving ? 'Enregistrement...' : (editItem ? 'Modifier' : 'Créer')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDetail && selectedMaintenance && (
                <MaintenanceDetail
                    isOpen={showDetail}
                    onClose={() => {
                        setShowDetail(false);
                        setSelectedMaintenance(null);
                    }}
                    maintenance={selectedMaintenance}
                />
            )}
        </div>
    );
};

export default Maintenance;