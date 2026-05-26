import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, User, LogOut, Settings, Building2, UserCircle, ChevronRight, CheckCircle, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useClientAuth } from '../../contexts/ClientAuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { NotificationList } from '../notifications';

interface ClientHeaderProps {
	toggleSidebar: () => void;
	sidebarOpen: boolean;
	isMobile: boolean;
}

const COLORS = {
	primary: '#1A3C5E',
	primaryLight: '#2A5C8E',
	accent: '#FFC107',
	white: '#FFFFFF',
	border: 'rgba(26, 60, 94, 0.1)',
	borderLight: 'rgba(26, 60, 94, 0.05)',
	background: '#F5F7FA',
	danger: '#DC3545'
};

const ClientHeader: React.FC<ClientHeaderProps> = ({ toggleSidebar, sidebarOpen, isMobile }) => {
	const { user, logout } = useAuth();
	const { clientData } = useClientAuth();
	const { unreadCount } = useNotifications();
	const [isProfileOpen, setIsProfileOpen] = useState(false);
	const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
	const [imageError, setImageError] = useState(false);
	const profileRef = useRef<HTMLDivElement>(null);
	const notificationRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
				setIsProfileOpen(false);
			}
			if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
				setIsNotificationsOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const getInitials = (name: string) => {
		return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
	};

	const getRoleColor = () => {
		return COLORS.accent;
	};

	const getRoleLabel = () => {
		return 'Client';
	};

	const getRoleIcon = () => {
		return <UserCircle className="w-4 h-4" />;
	};

	const handleLogout = () => {
		logout();
		window.location.href = '/login';
	};

	const handleViewAllNotifications = () => {
		window.location.href = '/client/chat';
		setIsNotificationsOpen(false);
	};

	const getPageTitle = () => {
		const path = window.location.pathname;
		if (path === '/client/dashboard') return 'Tableau de bord';
		if (path === '/client/sales') return 'Mes ventes';
		if (path === '/client/equipment') return 'Mes équipements';
		if (path === '/client/maintenance') return 'Maintenances';
		if (path === '/client/profile') return 'Mon profil';
		if (path === '/client/company') return 'Mon entreprise';
		if (path === '/client/settings') return 'Paramètres';
		if (path === '/client/chat') return 'Messagerie';
		return 'Espace client';
	};

	const getPageSubtitle = () => {
		const path = window.location.pathname;
		if (path === '/client/dashboard') return 'Vue d\'ensemble de votre activité';
		if (path === '/client/sales') return 'Historique de vos achats';
		if (path === '/client/equipment') return 'Suivez votre parc matériel';
		if (path === '/client/maintenance') return 'Planifiez vos interventions';
		if (path === '/client/profile') return 'Gérez vos informations personnelles';
		if (path === '/client/company') return 'Gérez les informations de votre entreprise';
		if (path === '/client/settings') return 'Personnalisez votre expérience';
		if (path === '/client/chat') return 'Vos conversations en temps réel';
		return clientData?.companyName || 'Gérez votre espace client';
	};

	return (
		<header className="sticky top-0 z-20 bg-white border-b shadow-sm" style={{ backgroundColor: COLORS.white, borderColor: COLORS.border }}>
			<div className="px-4 md:px-6 py-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						{isMobile && (
							<button
								onClick={toggleSidebar}
								className="p-2 rounded-lg transition-all duration-200 hover:bg-gray-100 focus:outline-none"
								aria-label={sidebarOpen ? 'Fermer menu' : 'Ouvrir menu'}
							>
								<Menu className="w-6 h-6" style={{ color: COLORS.primary }} />
							</button>
						)}
						<div>
							<h1 className="text-xl md:text-2xl font-bold" style={{ color: COLORS.primary, fontFamily: 'var(--font-secondary)' }}>
								{getPageTitle()}
							</h1>
							<p className="text-sm hidden md:block" style={{ color: COLORS.primary, opacity: 0.7 }}>
								{getPageSubtitle()}
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2 md:gap-4">
						<div className="relative" ref={notificationRef}>
							<button
								onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
								className="relative p-2 rounded-lg transition-all duration-200 hover:bg-gray-100"
								aria-label="Notifications"
							>
								<Bell className="w-5 h-5 md:w-6 md:h-6" style={{ color: COLORS.primary }} />
								{unreadCount > 0 && (
									<span
										className="absolute -top-1 -right-1 min-w-5 h-5 rounded-full text-xs flex items-center justify-center px-1 animate-pulse"
										style={{ backgroundColor: COLORS.accent, color: COLORS.primary, fontWeight: 'bold' }}
									>
										{unreadCount > 99 ? '99+' : unreadCount}
									</span>
								)}
							</button>

							{isNotificationsOpen && (
								<div className="absolute right-0 mt-2 w-96 z-50">
									<NotificationList
										onViewAll={handleViewAllNotifications}
										onClose={() => setIsNotificationsOpen(false)}
									/>
								</div>
							)}
						</div>

						<div className="relative" ref={profileRef}>
							<button
								onClick={() => setIsProfileOpen(!isProfileOpen)}
								className="flex items-center gap-2 md:gap-3 p-1 md:p-2 rounded-lg transition-all duration-200 hover:bg-gray-100 group"
							>
								<div className="relative">
									{clientData?.logoUrl && !imageError ? (
										<img
											src={clientData.logoUrl}
											alt={clientData.companyName || 'Avatar'}
											className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 transition-all group-hover:scale-105"
											style={{ borderColor: COLORS.accent }}
											onError={() => setImageError(true)}
										/>
									) : (
										<div
											className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-base transition-all group-hover:scale-105"
											style={{ backgroundColor: getRoleColor() }}
										>
											{clientData?.companyName ? getInitials(clientData.companyName) : 'C'}
										</div>
									)}
									<div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: COLORS.accent }} />
								</div>
								<div className="hidden md:block text-left">
									<p className="text-sm font-medium" style={{ color: COLORS.primary }}>{user?.name || 'Client'}</p>
									<p className="text-xs flex items-center gap-1" style={{ color: COLORS.primary, opacity: 0.7 }}>
										{getRoleIcon()}
										{getRoleLabel()}
									</p>
								</div>
								<svg
									className={`hidden md:block w-4 h-4 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`}
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									style={{ color: COLORS.primary, opacity: 0.6 }}
								>
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
								</svg>
							</button>

							{isProfileOpen && (
								<div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl overflow-hidden z-50 border animate-fadeInUp" style={{ borderColor: COLORS.border }}>
									<div className="p-4 border-b" style={{ borderColor: COLORS.border }}>
										<div className="flex items-center gap-3">
											{clientData?.logoUrl && !imageError ? (
												<img
													src={clientData.logoUrl}
													alt={clientData.companyName || 'Avatar'}
													className="w-12 h-12 rounded-full object-cover border-2"
													style={{ borderColor: COLORS.accent }}
												/>
											) : (
												<div
													className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
													style={{ backgroundColor: getRoleColor() }}
												>
													{clientData?.companyName ? getInitials(clientData.companyName) : 'C'}
												</div>
											)}
											<div className="flex-1">
												<p className="font-semibold" style={{ color: COLORS.primary }}>{user?.name || 'Client'}</p>
												<p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>{user?.email || ''}</p>
												<span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: `${getRoleColor()}15`, color: getRoleColor() }}>
													{getRoleIcon()}
													{getRoleLabel()}
												</span>
											</div>
											<div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.accent }}>
												<CheckCircle className="w-3 h-3" style={{ color: COLORS.primary }} />
											</div>
										</div>
									</div>

									<div className="py-2">
										<button
											onClick={() => { window.location.href = '/client/profile'; setIsProfileOpen(false); }}
											className="w-full px-4 py-2.5 text-left transition-colors hover:bg-gray-50 flex items-center gap-3 group"
										>
											<div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors group-hover:bg-yellow-50" style={{ backgroundColor: `${COLORS.accent}10` }}>
												<User className="w-4 h-4" style={{ color: COLORS.accent }} />
											</div>
											<div className="flex-1">
												<p className="text-sm font-medium" style={{ color: COLORS.primary }}>Mon profil</p>
												<p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>Gérer vos informations</p>
											</div>
											<ChevronRight className="w-4 h-4 opacity-40" style={{ color: COLORS.primary }} />
										</button>

										<button
											onClick={() => { window.location.href = '/client/company'; setIsProfileOpen(false); }}
											className="w-full px-4 py-2.5 text-left transition-colors hover:bg-gray-50 flex items-center gap-3 group"
										>
											<div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors group-hover:bg-yellow-50" style={{ backgroundColor: `${COLORS.accent}10` }}>
												<Building2 className="w-4 h-4" style={{ color: COLORS.accent }} />
											</div>
											<div className="flex-1">
												<p className="text-sm font-medium" style={{ color: COLORS.primary }}>Mon entreprise</p>
												<p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>Informations société</p>
											</div>
											<ChevronRight className="w-4 h-4 opacity-40" style={{ color: COLORS.primary }} />
										</button>

										<button
											onClick={() => { window.location.href = '/client/chat'; setIsProfileOpen(false); }}
											className="w-full px-4 py-2.5 text-left transition-colors hover:bg-gray-50 flex items-center gap-3 group"
										>
											<div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors group-hover:bg-yellow-50" style={{ backgroundColor: `${COLORS.accent}10` }}>
												<MessageSquare className="w-4 h-4" style={{ color: COLORS.accent }} />
											</div>
											<div className="flex-1">
												<p className="text-sm font-medium" style={{ color: COLORS.primary }}>Messagerie</p>
												<p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>Vos conversations</p>
											</div>
											<ChevronRight className="w-4 h-4 opacity-40" style={{ color: COLORS.primary }} />
										</button>

										<button
											onClick={() => { window.location.href = '/client/settings'; setIsProfileOpen(false); }}
											className="w-full px-4 py-2.5 text-left transition-colors hover:bg-gray-50 flex items-center gap-3 group"
										>
											<div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors group-hover:bg-yellow-50" style={{ backgroundColor: `${COLORS.accent}10` }}>
												<Settings className="w-4 h-4" style={{ color: COLORS.accent }} />
											</div>
											<div className="flex-1">
												<p className="text-sm font-medium" style={{ color: COLORS.primary }}>Paramètres</p>
												<p className="text-xs" style={{ color: COLORS.primary, opacity: 0.5 }}>Préférences</p>
											</div>
											<ChevronRight className="w-4 h-4 opacity-40" style={{ color: COLORS.primary }} />
										</button>
									</div>
									<div className="border-t" style={{ borderColor: COLORS.border }} />

									<div className="py-2">
										<button
											onClick={handleLogout}
											className="w-full px-4 py-2.5 text-left transition-colors hover:bg-red-50 flex items-center gap-3 group"
										>
											<div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors group-hover:bg-red-100" style={{ backgroundColor: '#DC354515' }}>
												<LogOut className="w-4 h-4" style={{ color: COLORS.danger }} />
											</div>
											<div className="flex-1">
												<p className="text-sm font-medium" style={{ color: COLORS.danger }}>Déconnexion</p>
												<p className="text-xs" style={{ color: COLORS.danger, opacity: 0.7 }}>Quitter l'application</p>
											</div>
											<ChevronRight className="w-4 h-4 opacity-40" style={{ color: COLORS.danger }} />
										</button>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</header>
	);
};

export default ClientHeader;