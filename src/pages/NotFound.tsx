import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Search } from 'lucide-react'

const NotFound = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                    <Search size={48} className="text-primary" />
                </motion.div>

                <h1 className="text-6xl font-bold text-primary font-secondary mb-4">
                    404
                </h1>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                    Page non trouvée
                </h2>
                <p className="text-gray-500 mb-8">
                    La page que vous recherchez n'existe pas ou a été déplacée.
                </p>

                <Link to="/dashboard">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn-primary flex items-center gap-2 mx-auto"
                    >
                        <Home size={18} />
                        Retour à l'accueil
                    </motion.button>
                </Link>
            </motion.div>
        </div>
    )
}

export default NotFound