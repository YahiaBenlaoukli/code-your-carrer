import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Upload, BarChart3, Calendar } from 'lucide-react'

function Navigation() {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    {
      path: '/upload',
      label: 'Upload CV',
      icon: Upload
    },
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: BarChart3
    }
  ]

  return (
    <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40">
      <div className="glass-effect rounded-full px-4 py-2 shadow-lg">
        <div className="flex space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-secondary-600 hover:text-primary-600 hover:bg-white/50'
                }`}
              >
                <Icon size={16} />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default Navigation 