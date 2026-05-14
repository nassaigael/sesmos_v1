import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, LogIn, Building2, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const Login = () => {
    const [email, setEmail] = useState('admin@sesmos.com')
    const [password, setPassword] = useState('Admin123!')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            await login(email, password)
            toast.success('Connexion réussie !', {
                duration: 4000,
            })
            navigate('/dashboard')
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erreur de connexion', {
                duration: 4000,
            })
        } finally {
            setIsLoading(false)
        }
    }

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.5,
                ease: 'easeOut',
                staggerChildren: 0.1,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#1A3C5E] via-[#1A3C5E]/90 to-[#1A3C5E]/80 p-4 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#F5A623]/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#F5A623]/20 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
            </div>

            {/* Floating particles */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white/20 rounded-full"
                        initial={{
                            x: Math.random() * window.innerWidth,
                            y: Math.random() * window.innerHeight,
                            opacity: 0,
                        }}
                        animate={{
                            y: [null, -100, -200],
                            opacity: [0, 0.5, 0],
                        }}
                        transition={{
                            duration: Math.random() * 5 + 3,
                            repeat: Infinity,
                            delay: Math.random() * 5,
                        }}
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                    />
                ))}
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10 w-full max-w-md"
            >
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">

                    {/* Header */}
                    <motion.div variants={itemVariants} className="bg-linear-to-br from-[#1A3C5E] to-[#1A3C5E]/90 p-8 text-center relative">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="w-24 h-24 bg-linear-to-br from-[#F5A623] to-[#F5A623]/80 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg relative"
                        >
                            <Building2 size={48} className="text-white" />
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                                className="absolute -top-1 -right-1 w-6 h-6 bg-[#F5A623] rounded-full flex items-center justify-center"
                            >
                            </motion.div>
                        </motion.div>

                        <motion.h1
                            variants={itemVariants}
                            className="text-3xl font-bold text-white font-secondary"
                        >
                            SESMOS
                        </motion.h1>
                        <motion.p
                            variants={itemVariants}
                            className="text-white/80 text-sm mt-1"
                        >
                            Smart Equipment & Sales Monitoring System
                        </motion.p>
                    </motion.div>

                    {/* Form */}
                    <motion.div variants={itemVariants} className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email field */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Adresse email
                                </label>
                                <div className="relative group">
                                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1A3C5E] transition-colors" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoComplete="off"
                                        autoCorrect="off"
                                        autoCapitalize="off"
                                        spellCheck="false"
                                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1A3C5E] transition-all duration-200 bg-white/50"
                                        placeholder="exemple@sesmos.com"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password field */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Mot de passe
                                </label>
                                <div className="relative group">
                                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1A3C5E] transition-colors" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="off"
                                        autoCorrect="off"
                                        autoCapitalize="off"
                                        spellCheck="false"
                                        className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1A3C5E] transition-all duration-200 bg-white/50"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1A3C5E] transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Remember me & Forgot password */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-4 h-4 text-[#1A3C5E] rounded border-gray-300 focus:ring-[#1A3C5E]"
                                    />
                                    <span className="text-sm text-gray-600">Se souvenir de moi</span>
                                </label>
                                <button
                                    type="button"
                                    className="text-sm text-[#F5A623] hover:text-[#F5A623]/80 transition-colors"
                                    onClick={() => toast('Fonctionnalité à venir', { icon: '🔜' })}
                                >
                                    Mot de passe oublié ?
                                </button>
                            </div>

                            {/* Submit button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#1A3C5E] hover:bg-[#0F2A45] py-3 flex items-center justify-center gap-2 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Connexion en cours...</span>
                                    </div>
                                ) : (
                                    <>
                                        <LogIn size={18} />
                                        <span>Se connecter</span>
                                    </>
                                )}
                            </motion.button>
                        </form>

                        {/* Footer */}
                        <div className="mt-6 text-center">
                            <p className="text-xs text-gray-400">
                                © 2025 SESMOS - Tous droits réservés
                            </p>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    )
}

export default Login