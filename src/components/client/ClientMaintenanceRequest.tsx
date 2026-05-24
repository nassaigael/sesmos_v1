import React, { useState } from 'react';
import { X, AlertTriangle, Calendar, FileText, Send, Wrench, AlertCircle, Clock } from 'lucide-react';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';

interface ClientMaintenanceRequestProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
	equipmentId: string;
	equipmentName: string;
	clientId: string;
}

const COLORS = {
	primary: '#1A3C5E',
	accent: '#FFC107',
	border: 'rgba(26, 60, 94, 0.1)',
	borderLight: 'rgba(26, 60, 94, 0.05)',
	danger: '#DC3545',
	white: '#FFFFFF'
};

const MAINTENANCE_TYPES = [
	{ value: 'PREVENTIVE', label: 'Préventive', description: 'Maintenance planifiée', icon: Wrench },
	{ value: 'CORRECTIVE', label: 'Corrective', description: 'Réparation d\'une panne', icon: AlertCircle },
	{ value: 'URGENT', label: 'Urgente', description: 'Intervention immédiate nécessaire', icon: Clock }
];

const ClientMaintenanceRequest: React.FC<ClientMaintenanceRequestProps> = ({
	isOpen,
	onClose,
	onSuccess,
	equipmentId,
	equipmentName,
	clientId
}) => {
	const [formData, setFormData] = useState({
		type: 'CORRECTIVE',
		description: '',
		scheduledDate: ''
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.description.trim()) {
			setError('Veuillez décrire le problème');
			return;
		}

		setLoading(true);
		setError(null);

		try {
			await api.post('/maintenances/request', {
				equipmentId,
				clientId,
				type: formData.type,
				description: formData.description,
				scheduledDate: formData.scheduledDate || null
			});

			toast.success('Demande de maintenance envoyée avec succès');
			onSuccess();
			onClose();
		} catch (err: any) {
			console.error('Error creating maintenance:', err);
			setError(err.response?.data?.message || 'Erreur lors de l\'envoi de la demande');
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen) return null;

	const selectedType = MAINTENANCE_TYPES.find(t => t.value === formData.type);

	return (
		<div className="fixed inset-0 z-50 overflow-y-auto">
			<div className="flex items-center justify-center min-h-screen px-4 py-6">
				<div
					className="fixed inset-0 backdrop-blur-md transition-all duration-300"
					style={{ backgroundColor: 'rgba(26, 60, 94, 0.3)' }}
					onClick={onClose}
				/>

				<div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all duration-300">
					<div className="relative h-20" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, #2A5C8E 100%)` }}>
						<div className="absolute bottom-3 left-5">
							<h2 className="text-white font-semibold text-base">
								Demander une maintenance
							</h2>
							<p className="text-white/60 text-xs">
								{equipmentName}
							</p>
						</div>
						<button
							onClick={onClose}
							className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all flex items-center justify-center"
						>
							<X className="w-4 h-4 text-white" />
						</button>
					</div>

					<form onSubmit={handleSubmit} className="p-5 space-y-4">
						{error && (
							<div className="p-2.5 rounded-xl flex items-center gap-2" style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)' }}>
								<AlertTriangle className="w-4 h-4" style={{ color: COLORS.danger }} />
								<span className="text-sm" style={{ color: COLORS.danger }}>{error}</span>
							</div>
						)}

						<div>
							<label className="block text-xs font-semibold mb-1.5" style={{ color: COLORS.primary }}>
								Type de maintenance *
							</label>
							<div className="grid grid-cols-3 gap-2">
								{MAINTENANCE_TYPES.map(type => {
									const Icon = type.icon;
									const isSelected = formData.type === type.value;
									return (
										<button
											key={type.value}
											type="button"
											onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
											className={`p-3 rounded-xl border-2 text-center transition-all duration-200 ${isSelected
													? 'border-[#FFC107] bg-[rgba(255,193,7,0.1)] shadow-sm'
													: 'border-gray-200 hover:border-[#FFC107] hover:bg-gray-50'
												}`}
										>
											<Icon className={`w-6 h-6 mx-auto mb-1.5 ${isSelected ? 'text-[#FFC107]' : 'text-gray-400'}`} />
											<p className={`text-xs font-medium ${isSelected ? 'text-[#FFC107]' : 'text-gray-600'}`}>
												{type.label}
											</p>
											<p className="text-[10px] mt-0.5 text-gray-400">
												{type.description}
											</p>
										</button>
									);
								})}
							</div>
						</div>

						<div>
							<label className="block text-xs font-semibold mb-1.5" style={{ color: COLORS.primary }}>
								Date souhaitée (optionnelle)
							</label>
							<div className="relative">
								<Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: COLORS.primary, opacity: 0.4 }} />
								<input
									type="datetime-local"
									name="scheduledDate"
									value={formData.scheduledDate}
									onChange={handleChange}
									className="w-full pl-10 pr-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all"
									style={{ borderColor: COLORS.border }}
									onFocus={(e) => e.target.style.borderColor = COLORS.accent}
									onBlur={(e) => e.target.style.borderColor = COLORS.border}
								/>
							</div>
						</div>

						<div>
							<label className="block text-xs font-semibold mb-1.5" style={{ color: COLORS.primary }}>
								Description du problème *
							</label>
							<div className="relative">
								<FileText className="absolute left-3 top-3 w-4 h-4" style={{ color: COLORS.primary, opacity: 0.4 }} />
								<textarea
									name="description"
									value={formData.description}
									onChange={handleChange}
									rows={4}
									className="w-full pl-10 pr-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all resize-none"
									style={{ borderColor: COLORS.border }}
									onFocus={(e) => e.target.style.borderColor = COLORS.accent}
									onBlur={(e) => e.target.style.borderColor = COLORS.border}
									placeholder="Décrivez le problème rencontré..."
								/>
							</div>
						</div>

						{selectedType && formData.description && (
							<div className="p-3 rounded-xl" style={{ backgroundColor: COLORS.borderLight }}>
								<p className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: COLORS.primary }}>
									<Send className="w-3 h-3" style={{ color: COLORS.accent }} />
									Résumé de la demande
								</p>
								<div className="space-y-1.5 text-xs">
									<div className="flex justify-between items-center">
										<span className="flex items-center gap-1" style={{ color: COLORS.primary, opacity: 0.6 }}>
											<Wrench className="w-3 h-3" />
											Équipement :
										</span>
										<span className="font-medium" style={{ color: COLORS.primary }}>{equipmentName}</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="flex items-center gap-1" style={{ color: COLORS.primary, opacity: 0.6 }}>
											<AlertCircle className="w-3 h-3" />
											Type :
										</span>
										<span className="font-medium" style={{ color: COLORS.accent }}>{selectedType.label}</span>
									</div>
									<div className="flex justify-between items-start">
										<span className="flex items-center gap-1" style={{ color: COLORS.primary, opacity: 0.6 }}>
											<FileText className="w-3 h-3" />
											Description :
										</span>
										<span className="font-medium max-w-45 text-right truncate" style={{ color: COLORS.primary }}>
											{formData.description.length > 35 ? formData.description.substring(0, 35) + '...' : formData.description}
										</span>
									</div>
								</div>
							</div>
						)}

						<div className="flex gap-3 pt-2">
							<button
								type="button"
								onClick={onClose}
								className="flex-1 px-3 py-2 rounded-xl border transition-all text-sm font-medium hover:bg-gray-50"
								style={{ borderColor: COLORS.border, color: COLORS.primary }}
							>
								Annuler
							</button>
							<button
								type="submit"
								disabled={loading}
								className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-white transition-all hover:opacity-90 disabled:opacity-50 text-sm font-medium"
								style={{ backgroundColor: COLORS.accent, color: COLORS.primary }}
							>
								{loading ? (
									<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
								) : (
									<>
										<Send className="w-4 h-4" />
										Envoyer la demande
									</>
								)}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default ClientMaintenanceRequest;