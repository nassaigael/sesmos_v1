// components/notifications/NotificationCenter.tsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Bell, X, CheckCheck, Trash2, Circle,
    ShoppingBag, AlertTriangle, Package, Wrench, RefreshCw
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { notificationApi } from '../../api/notificationApi'
import type { NotificationResponse } from '../../types/notification.types'

interface NotificationCenterProps {
    onClose?: () => void
    onUnreadCountChange?: (count: number) => void
}

const getIcon = (type: string) => {
    switch (type) {
        case 'SALE_ALERT': return <ShoppingBag size={18} style={{ color: 'var(--color-success)' }} />
        case 'EQUIPMENT_DOWN': return <AlertTriangle size={18} style={{ color: 'var(--color-danger)' }} />
        case 'STOCK_CRITICAL': return <Package size={18} style={{ color: 'var(--color-warning)' }} />
        case 'MAINTENANCE_UPDATE': return <Wrench size={18} style={{ color: 'var(--color-accent)' }} />
        default: return <Bell size={18} style={{ color: 'var(--color-primary)' }} />
    }
}

const getBg = (type: string, isRead: boolean) => {
    if (isRead) return '#ffffff'
    switch (type) {
        case 'SALE_ALERT': return 'rgba(40,167,69,0.05)'
        case 'EQUIPMENT_DOWN': return 'rgba(220,53,69,0.05)'
        case 'STOCK_CRITICAL': return 'rgba(255,193,7,0.05)'
        case 'MAINTENANCE_UPDATE': return 'rgba(245,166,35,0.05)'
        default: return 'rgba(26,60,94,0.05)'
    }
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose, onUnreadCountChange }) => {
    const [notifications, setNotifications] = useState<NotificationResponse[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all')

    const loadNotifications = async () => {
        setIsLoading(true)
        try {
            const response = await notificationApi.getMyNotifications()
            const data: NotificationResponse[] = Array.isArray(response.data) ? response.data : []
            setNotifications(data)
            onUnreadCountChange?.(data.filter(n => !n.isRead).length)
        } catch {
            toast.error('Impossible de charger les notifications')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => { loadNotifications() }, [])

    const markAsRead = async (id: string) => {
        try {
            await notificationApi.markAsRead(id)
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
            onUnreadCountChange?.(notifications.filter(n => !n.isRead && n.id !== id).length)
        } catch {
            toast.error('Impossible de marquer la notification comme lue')
        }
    }

    const markAllAsRead = async () => {
        try {
            await notificationApi.markAllAsRead()
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
            onUnreadCountChange?.(0)
            toast.success('Toutes les notifications marquées comme lues')
        } catch {
            toast.error('Erreur lors du marquage')
        }
    }

    const deleteRead = async () => {
        try {
            await notificationApi.deleteAllRead()
            setNotifications(prev => prev.filter(n => !n.isRead))
            toast.success('Notifications lues supprimées')
        } catch {
            toast.error('Impossible de supprimer')
        }
    }

    const filtered = notifications.filter(n => activeTab === 'all' || !n.isRead)
    const unreadCount = notifications.filter(n => !n.isRead).length

    return (
        <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="bg-white rounded-xl shadow-2xl border w-96 overflow-hidden"
            style={{ borderColor: 'var(--color-border)' }}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b"
                style={{ borderColor: 'var(--color-border)', background: 'rgba(26,60,94,0.03)' }}>
                <div className="flex items-center gap-2">
                    <Bell size={18} style={{ color: 'var(--color-primary)' }} />
                    <h3 className="font-semibold text-sm" style={{ color: 'var(--color-primary)' }}>Notifications</h3>
                    {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 text-xs font-bold text-white rounded-full"
                            style={{ background: 'var(--color-danger)' }}>{unreadCount}</span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={loadNotifications} className="p-1.5 rounded-lg hover:bg-gray-100" title="Rafraîchir">
                        <RefreshCw size={14} className="opacity-60" />
                    </button>
                    {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="p-1.5 rounded-lg hover:bg-gray-100" title="Tout marquer comme lu">
                            <CheckCheck size={15} className="opacity-60" />
                        </button>
                    )}
                    <button onClick={deleteRead} className="p-1.5 rounded-lg hover:bg-gray-100" title="Supprimer les lues">
                        <Trash2 size={15} className="opacity-60" />
                    </button>
                    {onClose && (
                        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
                            <X size={15} className="opacity-60" />
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b" style={{ borderColor: 'var(--color-border)' }}>
                {(['all', 'unread'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2.5 text-sm font-medium transition-all ${activeTab === tab ? 'border-b-2' : 'opacity-50 hover:opacity-75'}`}
                        style={activeTab === tab ? { color: 'var(--color-primary)', borderColor: 'var(--color-primary)' } : { color: 'var(--color-text)' }}>
                        {tab === 'all' ? `Toutes (${notifications.length})` : <>Non lues {unreadCount > 0 && <span className="ml-1 px-1.5 text-xs text-white rounded-full" style={{ background: 'var(--color-danger)' }}>{unreadCount}</span>}</>}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center py-12 text-center px-4">
                        <Bell size={36} className="mb-3 opacity-20" />
                        <p className="text-sm font-medium opacity-50">Aucune notification</p>
                        <p className="text-xs mt-1 opacity-40">{activeTab === 'unread' ? 'Toutes vos notifications sont lues' : 'Rien pour le moment'}</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {filtered.map((n, i) => (
                            <motion.div key={n.id}
                                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 12 }} transition={{ delay: i * 0.02 }}
                                onClick={() => !n.isRead && markAsRead(n.id)}
                                className="p-4 border-b transition-all"
                                style={{ borderColor: 'var(--color-border)', background: getBg(n.type, n.isRead), cursor: n.isRead ? 'default' : 'pointer' }}>
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0 mt-0.5">{getIcon(n.type)}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm" style={{ fontWeight: n.isRead ? 400 : 600, color: 'var(--color-text)' }}>{n.message}</p>
                                        <p className="text-xs mt-1 opacity-50" style={{ color: 'var(--color-text)' }}>
                                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: fr })}
                                        </p>
                                    </div>
                                    {!n.isRead && <Circle size={8} style={{ color: 'var(--color-primary)', fill: 'var(--color-primary)', marginTop: 4, flexShrink: 0 }} />}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </motion.div>
    )
}

export default NotificationCenter