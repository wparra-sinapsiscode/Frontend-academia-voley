import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiSearch, FiFilter, FiEye, FiEdit, FiTrash2, FiCalendar, FiMapPin, FiUsers, FiAward, FiClock } from 'react-icons/fi';
import { useAppContext } from '../../contexts/AppContext';

interface Tournament {
  id: string;
  name: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  location: string;
  maxTeams: number;
  registeredTeams: number;
  registrationFee: number;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  prizes: Prize[];
  schedule: Match[];
  rules: string;
}

interface Prize {
  position: number;
  reward: string;
  amount?: number;
}

interface Match {
  id: string;
  teamA: string;
  teamB: string;
  date: string;
  time: string;
  court: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  scoreA?: number;
  scoreB?: number;
}

interface Team {
  id: string;
  name: string;
  captain: string;
  members: string[];
  category: string;
  registrationDate: string;
}

const Tournaments: React.FC = () => {
  const { categories, students } = useAppContext();
  const [activeTab, setActiveTab] = useState<'tournaments' | 'teams' | 'schedule'>('tournaments');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'active' | 'completed' | 'cancelled'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showTournamentModal, setShowTournamentModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [selectedTournament, setSelectedTournament] = useState<string>('');

  // Mock data for tournaments
  const [tournaments, setTournaments] = useState<Tournament[]>([
    {
      id: '1',
      name: 'Copa Primavera 2024',
      description: 'Torneo de voleibol juvenil categoría mixta',
      category: 'juvenil',
      startDate: '2024-03-15',
      endDate: '2024-03-17',
      location: 'Polideportivo Central',
      maxTeams: 16,
      registeredTeams: 12,
      registrationFee: 125,
      status: 'upcoming',
      prizes: [
        { position: 1, reward: 'Trofeo de Oro + Medallas', amount: 1250 },
        { position: 2, reward: 'Trofeo de Plata + Medallas', amount: 750 },
        { position: 3, reward: 'Trofeo de Bronce + Medallas', amount: 375 }
      ],
      schedule: [],
      rules: 'Reglamento oficial de voleibol. Equipos de 6 jugadores. Partidos a 3 sets.'
    },
    {
      id: '2',
      name: 'Torneo Infantil',
      description: 'Competencia para categorías menores',
      category: 'infantil',
      startDate: '2024-02-20',
      endDate: '2024-02-22',
      location: 'Coliseo Municipal',
      maxTeams: 12,
      registeredTeams: 10,
      registrationFee: 75,
      status: 'active',
      prizes: [
        { position: 1, reward: 'Trofeo + Kit deportivo' },
        { position: 2, reward: 'Medallas + Kit deportivo' },
        { position: 3, reward: 'Medallas' }
      ],
      schedule: [],
      rules: 'Adaptaciones para categoría infantil. Menor altura de red.'
    }
  ]);

  // Mock data for teams
  const [teams, setTeams] = useState<Team[]>([
    {
      id: '1',
      name: 'Águilas Doradas',
      captain: 'Ana García',
      members: ['Ana García', 'Carlos Rodríguez', 'María López', 'Pedro Martínez', 'Sofía González', 'Luis Hernández'],
      category: 'juvenil',
      registrationDate: '2024-01-15'
    },
    {
      id: '2',
      name: 'Tigres Azules',
      captain: 'Carlos Rodríguez',
      members: ['Carlos Rodríguez', 'Laura Sánchez', 'Diego Torres', 'Camila Ruiz', 'Andrés Moreno', 'Valentina Castro'],
      category: 'juvenil',
      registrationDate: '2024-01-18'
    }
  ]);

  const filteredTournaments = tournaments.filter(tournament => {
    const matchesSearch = tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tournament.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || tournament.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || tournament.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleTournamentSubmit = (tournamentData: Partial<Tournament>) => {
    if (editingTournament) {
      setTournaments(tournaments.map(t => 
        t.id === editingTournament.id ? { ...t, ...tournamentData } : t
      ));
    } else {
      const newTournament: Tournament = {
        id: Date.now().toString(),
        ...tournamentData as Tournament,
        registeredTeams: 0,
        prizes: [],
        schedule: []
      };
      setTournaments([...tournaments, newTournament]);
      console.log('Nuevo torneo agregado:', newTournament);
    }
    setShowTournamentModal(false);
    setEditingTournament(null);
  };

  const handleTeamSubmit = (teamData: Partial<Team>) => {
    if (editingTeam) {
      setTeams(teams.map(t => 
        t.id === editingTeam.id ? { ...t, ...teamData } : t
      ));
    } else {
      const newTeam: Team = {
        id: Date.now().toString(),
        registrationDate: new Date().toISOString().split('T')[0],
        ...teamData as Team
      };
      setTeams([...teams, newTeam]);
    }
    setShowTeamModal(false);
    setEditingTeam(null);
  };

  const handleDeleteTeam = (teamId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este equipo?')) {
      setTeams(teams.filter(team => team.id !== teamId));
    }
  };

  const handleMatchSubmit = (matchData: Partial<Match>) => {
    if (editingMatch) {
      // Editar partido existente
      setTournaments(tournaments.map(tournament => 
        tournament.id === selectedTournament 
          ? { 
              ...tournament, 
              schedule: tournament.schedule.map(match =>
                match.id === editingMatch.id 
                  ? { ...match, ...matchData }
                  : match
              )
            }
          : tournament
      ));
    } else {
      // Crear nuevo partido
      const newMatch: Match = {
        id: Date.now().toString(),
        status: 'scheduled',
        ...matchData as Match
      };
      
      setTournaments(tournaments.map(tournament => 
        tournament.id === selectedTournament 
          ? { ...tournament, schedule: [...tournament.schedule, newMatch] }
          : tournament
      ));
    }
    
    setShowMatchModal(false);
    setEditingMatch(null);
  };

  const handleDeleteMatch = (matchId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este partido?')) {
      setTournaments(tournaments.map(tournament => 
        tournament.id === selectedTournament 
          ? { 
              ...tournament, 
              schedule: tournament.schedule.filter(match => match.id !== matchId)
            }
          : tournament
      ));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      upcoming: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
      active: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
      completed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
    };
    return statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      upcoming: 'Próximo',
      active: 'Activo',
      completed: 'Completado',
      cancelled: 'Cancelado'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Torneos</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestión de torneos y competencias</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowTeamModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 flex items-center space-x-2"
          >
            <FiUsers size={16} />
            <span>Nuevo Equipo</span>
          </button>
          <button
            onClick={() => setShowTournamentModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 flex items-center space-x-2"
          >
            <FiPlus size={16} />
            <span>Nuevo Torneo</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'tournaments', label: 'Torneos' },
            { key: 'teams', label: 'Equipos' },
            { key: 'schedule', label: 'Programación' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tournaments Tab */}
      {activeTab === 'tournaments' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar torneos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="upcoming">Próximos</option>
                <option value="active">Activos</option>
                <option value="completed">Completados</option>
                <option value="cancelled">Cancelados</option>
              </select>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name.toLowerCase()}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tournaments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map((tournament) => (
              <motion.div
                key={tournament.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{tournament.name}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(tournament.status)}`}>
                      {getStatusLabel(tournament.status)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{tournament.description}</p>
                  
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-2">
                      <FiCalendar size={16} />
                      <span>{tournament.startDate} - {tournament.endDate}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiMapPin size={16} />
                      <span>{tournament.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiUsers size={16} />
                      <span>{tournament.registeredTeams}/{tournament.maxTeams} equipos</span>
                    </div>
                    {tournament.registrationFee > 0 && (
                      <div className="flex items-center space-x-2">
                        <FiAward size={16} />
                        <span>Inscripción: {formatCurrency(tournament.registrationFee)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {tournament.category}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingTournament(tournament);
                            setShowTournamentModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <FiEdit size={16} />
                        </button>
                        <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Teams Tab */}
      {activeTab === 'teams' && (
        <div className="space-y-6">
          {/* Teams Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Equipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Capitán
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Miembros
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Registro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {teams.map((team) => (
                    <motion.tr
                      key={team.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{team.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-300">{team.captain}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 capitalize">
                          {team.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-300">{team.members.length} jugadores</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                        {team.registrationDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingTeam(team);
                              setShowTeamModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <FiEdit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteTeam(team.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          {/* Tournament Selector */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Seleccionar Torneo:</label>
              <select
                value={selectedTournament}
                onChange={(e) => setSelectedTournament(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar torneo ({tournaments.length} disponibles)</option>
                {tournaments.map(tournament => (
                  <option key={tournament.id} value={tournament.id}>
                    {tournament.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Schedule Content */}
          {selectedTournament ? (
            <div className="space-y-6">
              {/* Tournament Info */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                {(() => {
                  const tournament = tournaments.find(t => t.id === selectedTournament);
                  if (!tournament) return null;
                  
                  return (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{tournament.name}</h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(tournament.status)}`}>
                          {getStatusLabel(tournament.status)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <FiCalendar className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">Fechas</p>
                          <p className="font-medium text-gray-900 dark:text-white">{tournament.startDate} - {tournament.endDate}</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <FiUsers className="w-6 h-6 mx-auto mb-2 text-green-600" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">Equipos</p>
                          <p className="font-medium text-gray-900 dark:text-white">{tournament.registeredTeams}/{tournament.maxTeams}</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <FiMapPin className="w-6 h-6 mx-auto mb-2 text-red-600" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">Ubicación</p>
                          <p className="font-medium text-gray-900 dark:text-white">{tournament.location}</p>
                        </div>
                      </div>
                      
                      {/* Schedule/Matches Section */}
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white">Programación de Partidos</h4>
                          <button 
                            onClick={() => setShowMatchModal(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 flex items-center space-x-2"
                          >
                            <FiPlus size={16} />
                            <span>Programar Partido</span>
                          </button>
                        </div>
                        
                        {tournament.schedule && tournament.schedule.length > 0 ? (
                          <div className="space-y-3">
                            {tournament.schedule.map((match, index) => (
                              <div key={match.id || index} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4">
                                    <span className="font-medium text-gray-900 dark:text-white">
                                      {match.teamA} vs {match.teamB}
                                    </span>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                      {match.date} - {match.time}
                                    </span>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                      Cancha: {match.court}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      match.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                                      match.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                    }`}>
                                      {match.status === 'completed' ? 'Completado' :
                                       match.status === 'in_progress' ? 'En progreso' : 'Programado'}
                                    </span>
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => {
                                          setEditingMatch(match);
                                          setShowMatchModal(true);
                                        }}
                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                        title="Editar partido"
                                      >
                                        <FiEdit size={16} />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteMatch(match.id)}
                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                        title="Eliminar partido"
                                      >
                                        <FiTrash2 size={16} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                {match.status === 'completed' && match.scoreA !== undefined && match.scoreB !== undefined && (
                                  <div className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Resultado: {match.teamA} {match.scoreA} - {match.scoreB} {match.teamB}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <FiClock size={48} className="mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2 dark:text-white">No hay partidos programados</h3>
                            <p>Usa el botón "Programar Partido" para crear el cronograma del torneo</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <FiCalendar size={48} className="mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2 dark:text-white">Selecciona un Torneo</h3>
                <p>Elige un torneo para ver o programar partidos</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tournament Modal */}
      {showTournamentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingTournament ? 'Editar Torneo' : 'Nuevo Torneo'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              handleTournamentSubmit({
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                category: formData.get('category') as string,
                startDate: formData.get('startDate') as string,
                endDate: formData.get('endDate') as string,
                location: formData.get('location') as string,
                maxTeams: Number(formData.get('maxTeams')),
                registrationFee: Number(formData.get('registrationFee')),
                status: formData.get('status') as Tournament['status'],
                rules: formData.get('rules') as string
              });
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del Torneo</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingTournament?.name}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                  <textarea
                    name="description"
                    defaultValue={editingTournament?.description}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
                  <select
                    name="category"
                    defaultValue={editingTournament?.category}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name.toLowerCase()}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
                  <select
                    name="status"
                    defaultValue={editingTournament?.status}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="upcoming">Próximo</option>
                    <option value="active">Activo</option>
                    <option value="completed">Completado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de Inicio</label>
                  <input
                    type="date"
                    name="startDate"
                    defaultValue={editingTournament?.startDate}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de Fin</label>
                  <input
                    type="date"
                    name="endDate"
                    defaultValue={editingTournament?.endDate}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ubicación</label>
                  <input
                    type="text"
                    name="location"
                    defaultValue={editingTournament?.location}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Máximo de Equipos</label>
                  <input
                    type="number"
                    name="maxTeams"
                    defaultValue={editingTournament?.maxTeams}
                    min="2"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Costo de Inscripción</label>
                  <input
                    type="number"
                    name="registrationFee"
                    defaultValue={editingTournament?.registrationFee}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reglas</label>
                  <textarea
                    name="rules"
                    defaultValue={editingTournament?.rules}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowTournamentModal(false);
                    setEditingTournament(null);
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                >
                  {editingTournament ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Team Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingTeam ? 'Editar Equipo' : 'Nuevo Equipo'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const membersStr = formData.get('members') as string;
              const members = membersStr.split(',').map(m => m.trim()).filter(m => m);
              
              handleTeamSubmit({
                name: formData.get('name') as string,
                captain: formData.get('captain') as string,
                category: formData.get('category') as string,
                members: members
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del Equipo</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingTeam?.name}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capitán</label>
                  <select
                    name="captain"
                    defaultValue={editingTeam?.captain}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar capitán</option>
                    {students.map(student => (
                      <option key={student.id} value={student.name}>{student.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
                  <select
                    name="category"
                    defaultValue={editingTeam?.category}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name.toLowerCase()}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Miembros (separados por comas)
                  </label>
                  <textarea
                    name="members"
                    defaultValue={editingTeam?.members.join(', ')}
                    rows={4}
                    placeholder="Nombre 1, Nombre 2, Nombre 3..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowTeamModal(false);
                    setEditingTeam(null);
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                >
                  {editingTeam ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Match Modal */}
      {showMatchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingMatch ? 'Editar Partido' : 'Programar Partido'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              handleMatchSubmit({
                teamA: formData.get('teamA') as string,
                teamB: formData.get('teamB') as string,
                date: formData.get('date') as string,
                time: formData.get('time') as string,
                court: formData.get('court') as string
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Equipo A</label>
                  <select
                    name="teamA"
                    defaultValue={editingMatch?.teamA}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar equipo</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.name}>{team.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Equipo B</label>
                  <select
                    name="teamB"
                    defaultValue={editingMatch?.teamB}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar equipo</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.name}>{team.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha</label>
                  <input
                    type="date"
                    name="date"
                    defaultValue={editingMatch?.date}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hora</label>
                  <input
                    type="time"
                    name="time"
                    defaultValue={editingMatch?.time}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cancha</label>
                  <input
                    type="text"
                    name="court"
                    defaultValue={editingMatch?.court}
                    placeholder="Ej: Cancha 1, Cancha Principal..."
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowMatchModal(false);
                    setEditingMatch(null);
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                >
                  {editingMatch ? 'Actualizar' : 'Programar'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Tournaments;