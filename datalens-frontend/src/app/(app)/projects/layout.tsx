'use client';
import { ReactNode, useEffect, useState } from 'react';
import { FaPlus, FaCog, FaChevronDown, FaMoon, FaSun } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function ProjectLayout({ children }: { children: ReactNode }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(true);
    const router = useRouter();

    // Recuperar tema guardado
    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'light') setDarkMode(false);
    }, []);

    // Aplicar tema dinámicamente
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    return (
        <div
            className={`flex h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-800'
                }`}
        >
            {/* Sidebar */}
            <aside
                className={`w-64 p-4 flex flex-col justify-between shadow-lg transition-colors duration-300 ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'
                    }`}
            >
                <div>
                    <button
                        onClick={() => router.push('/project/new')}
                        className={`flex items-center justify-center w-full py-2 rounded-lg font-semibold transition ${darkMode
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                    >
                        <FaPlus className="mr-2" /> Nuevo Proyecto
                    </button>

                    <div className="mt-6">
                        <div
                            className="flex justify-between items-center cursor-pointer"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            <h2 className="font-semibold">Mis Proyectos</h2>
                            <FaChevronDown
                                className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            />
                        </div>
                        {isExpanded && (
                            <ul
                                className={`mt-2 pl-2 space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}
                            >
                                <li className="hover:text-blue-400 cursor-pointer">Proyecto A</li>
                                <li className="hover:text-blue-400 cursor-pointer">Proyecto B</li>
                            </ul>
                        )}
                    </div>
                </div>

                <div
                    className={`flex items-center gap-2 cursor-pointer transition ${darkMode
                            ? 'text-gray-400 hover:text-blue-400'
                            : 'text-gray-600 hover:text-blue-600'
                        }`}
                >
                    <FaCog /> Configuración
                </div>
            </aside>

            {/* Contenido principal */}
            <main className="flex-1 flex flex-col">
                {/* Header */}
                <header
                    className={`flex justify-between items-center p-4 shadow-sm relative transition-colors duration-300 ${darkMode
                            ? 'bg-gray-800 text-gray-100'
                            : 'bg-white text-gray-800 border-b border-gray-200'
                        }`}
                >
                    {/* Botón modo oscuro */}
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className={`p-2 rounded-lg transition ${darkMode
                                ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400'
                                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                            }`}
                        title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                    >
                        {darkMode ? <FaSun /> : <FaMoon />}
                    </button>

                    {/* Menú usuario */}
                    <div className="relative">
                        <button
                            className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition ${darkMode
                                    ? 'bg-gray-700 hover:bg-gray-600'
                                    : 'bg-gray-200 hover:bg-gray-300'
                                }`}
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <img
                                src="https://ui-avatars.com/api/?name=Usuario&background=1E3A8A&color=fff"
                                alt="Perfil"
                                className="w-8 h-8 rounded-full"
                            />
                            <span>Usuario</span>
                            <FaChevronDown
                                className={`ml-1 transition-transform ${isMenuOpen ? 'rotate-180' : ''
                                    }`}
                            />
                        </button>

                        {/* Dropdown */}
                        {isMenuOpen && (
                            <div
                                className={`absolute top-14 right-0 w-48 py-2 rounded-lg shadow-lg border transition-colors duration-300 z-10 ${darkMode
                                        ? 'bg-gray-800 border-gray-700 text-gray-200'
                                        : 'bg-white border-gray-200 text-gray-800'
                                    }`}
                            >
                                <button
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-700/20"
                                    onClick={() => alert('Ir al perfil')}
                                >
                                    Perfil
                                </button>
                                <button
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-700/20"
                                    onClick={() => alert('Configuraciones')}
                                >
                                    Configuración
                                </button>
                                <button
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-700/20 text-red-500"
                                    onClick={() => alert('Cerrar sesión')}
                                >
                                    Cerrar sesión
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* Cuerpo dinámico */}
                <div
                    className={`flex-1 p-8 overflow-y-auto transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'
                        }`}
                >
                    {children}
                </div>
            </main>
        </div>
    );
}