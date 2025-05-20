import React, { useState, useEffect } from 'react';
import { LineChart, BarChart, Baseline as Timeline, Plus, Trash2, Download, Info } from 'lucide-react';

// Types
interface Experience {
  id: string;
  titre: string;
  dateDebut: string;
  dateFin: string;
  description: string;
  type: 'professionnel' | 'personnel' | 'formation';
  niveauBienEtre: number;
  competencesAcquises: string[];
  apprentissages: string;
}

function App() {
  const [experiences, setExperiences] = useState<Experience[]>(() => {
    const savedExperiences = localStorage.getItem('experiences');
    return savedExperiences ? JSON.parse(savedExperiences) : [];
  });
  
  const [nouvelleExperience, setNouvelleExperience] = useState<Experience>({
    id: '',
    titre: '',
    dateDebut: '',
    dateFin: '',
    description: '',
    type: 'professionnel',
    niveauBienEtre: 5,
    competencesAcquises: [],
    apprentissages: ''
  });
  
  const [competence, setCompetence] = useState('');
  const [affichage, setAffichage] = useState<'liste' | 'chronologie' | 'graphique'>('liste');
  const [showModal, setShowModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(true);

  useEffect(() => {
    localStorage.setItem('experiences', JSON.stringify(experiences));
  }, [experiences]);

  const ajouterExperience = () => {
    if (nouvelleExperience.titre && nouvelleExperience.dateDebut) {
      const newExp = {
        ...nouvelleExperience,
        id: Date.now().toString()
      };
      setExperiences([...experiences, newExp]);
      resetForm();
    }
  };

  const resetForm = () => {
    setNouvelleExperience({
      id: '',
      titre: '',
      dateDebut: '',
      dateFin: '',
      description: '',
      type: 'professionnel',
      niveauBienEtre: 5,
      competencesAcquises: [],
      apprentissages: ''
    });
    setCompetence('');
  };

  const supprimerExperience = (id: string) => {
    setExperiences(experiences.filter(exp => exp.id !== id));
  };

  const ajouterCompetence = () => {
    if (competence.trim() !== '') {
      setNouvelleExperience({
        ...nouvelleExperience,
        competencesAcquises: [...nouvelleExperience.competencesAcquises, competence]
      });
      setCompetence('');
    }
  };

  const supprimerCompetence = (index: number) => {
    const newCompetences = [...nouvelleExperience.competencesAcquises];
    newCompetences.splice(index, 1);
    setNouvelleExperience({
      ...nouvelleExperience,
      competencesAcquises: newCompetences
    });
  };

  const exporterDonnees = () => {
    const dataStr = JSON.stringify(experiences, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'mon-parcours.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const genererPDF = () => {
    window.print();
  };

  // Tri des expériences par date
  const experienceTriees = [...experiences].sort((a, b) => 
    new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime()
  );

  // Calcul des statistiques
  const moyenneBienEtre = experiences.length > 0 
    ? experiences.reduce((sum, exp) => sum + exp.niveauBienEtre, 0) / experiences.length 
    : 0;
  
  const experiencesParType = {
    professionnel: experiences.filter(exp => exp.type === 'professionnel').length,
    personnel: experiences.filter(exp => exp.type === 'personnel').length,
    formation: experiences.filter(exp => exp.type === 'formation').length
  };

  const momentsForts = experiences
    .filter(exp => exp.niveauBienEtre >= 8)
    .sort((a, b) => b.niveauBienEtre - a.niveauBienEtre);

  const momentsDifficiles = experiences
    .filter(exp => exp.niveauBienEtre <= 3)
    .sort((a, b) => a.niveauBienEtre - b.niveauBienEtre);

  // Toutes les compétences uniques
  const toutesCompetences = Array.from(
    new Set(experiences.flatMap(exp => exp.competencesAcquises))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <header className="bg-indigo-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Parcours Pro & Perso</h1>
          <div className="flex space-x-4">
            <button 
              onClick={() => setAffichage('liste')}
              className={`p-2 rounded-md ${affichage === 'liste' ? 'bg-indigo-900' : 'hover:bg-indigo-600'}`}
              title="Vue liste"
            >
              <BarChart size={20} />
            </button>
            <button 
              onClick={() => setAffichage('chronologie')}
              className={`p-2 rounded-md ${affichage === 'chronologie' ? 'bg-indigo-900' : 'hover:bg-indigo-600'}`}
              title="Vue chronologique"
            >
              <Timeline size={20} />
            </button>
            <button 
              onClick={() => setAffichage('graphique')}
              className={`p-2 rounded-md ${affichage === 'graphique' ? 'bg-indigo-900' : 'hover:bg-indigo-600'}`}
              title="Vue graphique"
            >
              <LineChart size={20} />
            </button>
            <button 
              onClick={() => setShowModal(true)}
              className="bg-green-600 hover:bg-green-700 p-2 rounded-md flex items-center"
              title="Ajouter une expérience"
            >
              <Plus size={20} />
            </button>
            <button 
              onClick={() => setShowInfoModal(true)}
              className="bg-blue-600 hover:bg-blue-700 p-2 rounded-md flex items-center"
              title="Informations"
            >
              <Info size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {/* Synthèse */}
        <section className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-indigo-800">Synthèse de votre parcours</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-indigo-50 p-4 rounded-md">
              <h3 className="font-semibold text-indigo-700">Expériences</h3>
              <p className="text-2xl font-bold">{experiences.length}</p>
              <div className="text-sm mt-2">
                <div className="flex justify-between">
                  <span>Professionnelles</span>
                  <span>{experiencesParType.professionnel}</span>
                </div>
                <div className="flex justify-between">
                  <span>Personnelles</span>
                  <span>{experiencesParType.personnel}</span>
                </div>
                <div className="flex justify-between">
                  <span>Formations</span>
                  <span>{experiencesParType.formation}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-indigo-50 p-4 rounded-md">
              <h3 className="font-semibold text-indigo-700">Bien-être moyen</h3>
              <p className="text-2xl font-bold">{moyenneBienEtre.toFixed(1)}/10</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-indigo-600 h-2.5 rounded-full" 
                  style={{ width: `${moyenneBienEtre * 10}%` }}
                ></div>
              </div>
            </div>
            
            <div className="bg-indigo-50 p-4 rounded-md">
              <h3 className="font-semibold text-indigo-700">Compétences acquises</h3>
              <p className="text-2xl font-bold">{toutesCompetences.length}</p>
              <p className="text-sm mt-2 line-clamp-2">
                {toutesCompetences.slice(0, 3).join(', ')}
                {toutesCompetences.length > 3 ? ` et ${toutesCompetences.length - 3} autres...` : ''}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-indigo-700 mb-2">Moments forts</h3>
              {momentsForts.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {momentsForts.slice(0, 3).map(exp => (
                    <li key={exp.id}>
                      <span className="font-medium">{exp.titre}</span> 
                      <span className="text-sm text-gray-600"> ({exp.niveauBienEtre}/10)</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">Aucun moment fort identifié</p>
              )}
            </div>
            
            <div>
              <h3 className="font-semibold text-indigo-700 mb-2">Moments difficiles</h3>
              {momentsDifficiles.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {momentsDifficiles.slice(0, 3).map(exp => (
                    <li key={exp.id}>
                      <span className="font-medium">{exp.titre}</span> 
                      <span className="text-sm text-gray-600"> ({exp.niveauBienEtre}/10)</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">Aucun moment difficile identifié</p>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button 
              onClick={exporterDonnees}
              className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md mr-2"
            >
              <Download size={16} className="mr-1" /> Exporter
            </button>
            <button 
              onClick={genererPDF}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
            >
              Imprimer
            </button>
          </div>
        </section>

        {/* Affichage principal */}
        {affichage === 'liste' && (
          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 text-indigo-800">Liste des expériences</h2>
            
            {experiences.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Vous n'avez pas encore ajouté d'expériences</p>
                <button 
                  onClick={() => setShowModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md inline-flex items-center"
                >
                  <Plus size={16} className="mr-1" /> Ajouter une expérience
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {experienceTriees.map(exp => (
                  <div key={exp.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{exp.titre}</h3>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                            exp.type === 'professionnel' ? 'bg-blue-500' : 
                            exp.type === 'personnel' ? 'bg-green-500' : 'bg-amber-500'
                          }`}></span>
                          <span className="capitalize">{exp.type}</span>
                          <span className="mx-2">•</span>
                          <span>{exp.dateDebut} {exp.dateFin ? `→ ${exp.dateFin}` : ''}</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="mr-4 text-center">
                          <div className="text-sm text-gray-500">Bien-être</div>
                          <div className={`font-bold ${
                            exp.niveauBienEtre >= 7 ? 'text-green-600' : 
                            exp.niveauBienEtre >= 4 ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            {exp.niveauBienEtre}/10
                          </div>
                        </div>
                        <button 
                          onClick={() => supprimerExperience(exp.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{exp.description}</p>
                    
                    {exp.competencesAcquises.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-sm font-semibold text-gray-700 mb-1">Compétences acquises:</h4>
                        <div className="flex flex-wrap gap-1">
                          {exp.competencesAcquises.map((comp, idx) => (
                            <span key={idx} className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">
                              {comp}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {exp.apprentissages && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-1">Apprentissages clés:</h4>
                        <p className="text-gray-600 text-sm">{exp.apprentissages}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {affichage === 'chronologie' && (
          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 text-indigo-800">Chronologie</h2>
            
            {experiences.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Vous n'avez pas encore ajouté d'expériences</p>
                <button 
                  onClick={() => setShowModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md inline-flex items-center"
                >
                  <Plus size={16} className="mr-1" /> Ajouter une expérience
                </button>
              </div>
            ) : (
              <div className="relative">
                {/* Ligne verticale */}
                <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-indigo-200"></div>
                
                <div className="space-y-12">
                  {experienceTriees.map((exp, index) => (
                    <div key={exp.id} className={`relative flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                      {/* Point sur la ligne */}
                      <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-indigo-500 z-10"></div>
                      
                      {/* Date */}
                      <div className="absolute left-1/2 transform -translate-x-1/2 -top-8 text-sm font-medium text-gray-500">
                        {exp.dateDebut.split('-')[0]}
                      </div>
                      
                      {/* Contenu */}
                      <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8'}`}>
                        <div className={`bg-white p-4 rounded-lg border-2 ${
                          exp.type === 'professionnel' ? 'border-blue-200' : 
                          exp.type === 'personnel' ? 'border-green-200' : 'border-amber-200'
                        } shadow-sm hover:shadow-md transition-shadow`}>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold">{exp.titre}</h3>
                            <span className={`text-sm font-medium px-2 py-0.5 rounded ${
                              exp.type === 'professionnel' ? 'bg-blue-100 text-blue-800' : 
                              exp.type === 'personnel' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {exp.type}
                            </span>
                          </div>
                          
                          <div className="mb-2">
                            <div className="text-sm text-gray-500 mb-1">Niveau de bien-être:</div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  exp.niveauBienEtre >= 7 ? 'bg-green-500' : 
                                  exp.niveauBienEtre >= 4 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${exp.niveauBienEtre * 10}%` }}
                              ></div>
                            </div>
                            <div className="text-right text-xs mt-1">{exp.niveauBienEtre}/10</div>
                          </div>
                          
                          <p className="text-sm text-gray-600 line-clamp-2">{exp.description}</p>
                        </div>
                      </div>
                      
                      {/* Espace vide de l'autre côté */}
                      <div className="w-5/12"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {affichage === 'graphique' && (
          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 text-indigo-800">Évolution du bien-être</h2>
            
            {experiences.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Vous n'avez pas encore ajouté d'expériences</p>
                <button 
                  onClick={() => setShowModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md inline-flex items-center"
                >
                  <Plus size={16} className="mr-1" /> Ajouter une expérience
                </button>
              </div>
            ) : (
              <div>
                {/* Graphique simplifié */}
                <div className="h-64 relative mb-8">
                  {/* Axe Y */}
                  <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between items-end pr-2">
                    <span className="text-xs text-gray-500">10</span>
                    <span className="text-xs text-gray-500">5</span>
                    <span className="text-xs text-gray-500">0</span>
                  </div>
                  
                  {/* Zone du graphique */}
                  <div className="absolute left-12 right-0 top-0 bottom-0 border-l border-b border-gray-300">
                    {/* Lignes horizontales */}
                    <div className="absolute left-0 right-0 top-0 border-t border-gray-200"></div>
                    <div className="absolute left-0 right-0 top-1/2 border-t border-gray-200"></div>
                    <div className="absolute left-0 right-0 bottom-0 border-t border-gray-200"></div>
                    
                    {/* Points et lignes */}
                    {experienceTriees.length > 0 && (
                      <svg className="absolute inset-0 w-full h-full">
                        {/* Lignes entre les points */}
                        <polyline 
                          points={experienceTriees.map((exp, index) => {
                            const x = (index / (experienceTriees.length - 1)) * 100;
                            const y = 100 - (exp.niveauBienEtre / 10) * 100;
                            return `${x}% ${y}%`;
                          }).join(' ')}
                          fill="none"
                          stroke="#6366f1"
                          strokeWidth="2"
                        />
                        
                        {/* Points */}
                        {experienceTriees.map((exp, index) => {
                          const x = (index / (experienceTriees.length - 1)) * 100;
                          const y = 100 - (exp.niveauBienEtre / 10) * 100;
                          return (
                            <g key={exp.id}>
                              <circle 
                                cx={`${x}%`} 
                                cy={`${y}%`} 
                                r="4" 
                                fill={
                                  exp.type === 'professionnel' ? '#3b82f6' : 
                                  exp.type === 'personnel' ? '#10b981' : '#f59e0b'
                                }
                                stroke="#ffffff"
                                strokeWidth="1"
                              />
                              <text 
                                x={`${x}%`} 
                                y={`${y - 10}%`} 
                                textAnchor="middle" 
                                fontSize="10" 
                                fill="#4b5563"
                              >
                                {exp.niveauBienEtre}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    )}
                  </div>
                </div>
                
                {/* Légende */}
                <div className="flex justify-center space-x-8 mb-6">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-sm">Professionnel</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm">Personnel</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                    <span className="text-sm">Formation</span>
                  </div>
                </div>
                
                {/* Liste des expériences */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {experienceTriees.map((exp, index) => (
                    <div key={exp.id} className="border rounded p-3 text-sm">
                      <div className="font-medium">{index + 1}. {exp.titre}</div>
                      <div className="text-xs text-gray-500">{exp.dateDebut}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Modal d'ajout d'expérience */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Ajouter une expérience</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre de l'expérience*
                </label>
                <input
                  type="text"
                  value={nouvelleExperience.titre}
                  onChange={(e) => setNouvelleExperience({...nouvelleExperience, titre: e.target.value})}
                  className="w-full p-2 border rounded focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Ex: Chef de projet chez XYZ"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type d'expérience
                </label>
                <select
                  value={nouvelleExperience.type}
                  onChange={(e) => setNouvelleExperience({
                    ...nouvelleExperience, 
                    type: e.target.value as 'professionnel' | 'personnel' | 'formation'
                  })}
                  className="w-full p-2 border rounded focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="professionnel">Professionnel</option>
                  <option value="personnel">Personnel</option>
                  <option value="formation">Formation</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de début*
                </label>
                <input
                  type="date"
                  value={nouvelleExperience.dateDebut}
                  onChange={(e) => setNouvelleExperience({...nouvelleExperience, dateDebut: e.target.value})}
                  className="w-full p-2 border rounded focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de fin (si terminée)
                </label>
                <input
                  type="date"
                  value={nouvelleExperience.dateFin}
                  onChange={(e) => setNouvelleExperience({...nouvelleExperience, dateFin: e.target.value})}
                  className="w-full p-2 border rounded focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={nouvelleExperience.description}
                onChange={(e) => setNouvelleExperience({...nouvelleExperience, description: e.target.value})}
                className="w-full p-2 border rounded focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
                placeholder="Décrivez brièvement cette expérience..."
              ></textarea>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Niveau de bien-être ressenti (1-10)
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={nouvelleExperience.niveauBienEtre}
                  onChange={(e) => setNouvelleExperience({
                    ...nouvelleExperience, 
                    niveauBienEtre: parseInt(e.target.value)
                  })}
                  className="w-full"
                />
                <span className="ml-2 font-medium">{nouvelleExperience.niveauBienEtre}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Très négatif</span>
                <span>Neutre</span>
                <span>Très positif</span>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Compétences acquises
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={competence}
                  onChange={(e) => setCompetence(e.target.value)}
                  className="w-full p-2 border rounded-l focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Ex: Gestion de projet"
                />
                <button
                  type="button"
                  onClick={ajouterCompetence}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-r hover:bg-indigo-700"
                >
                  Ajouter
                </button>
              </div>
              
              {nouvelleExperience.competencesAcquises.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {nouvelleExperience.competencesAcquises.map((comp, index) => (
                    <div key={index} className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded flex items-center">
                      <span>{comp}</span>
                      <button
                        type="button"
                        onClick={() => supprimerCompetence(index)}
                        className="ml-1 text-indigo-600 hover:text-indigo-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apprentissages clés
              </label>
              <textarea
                value={nouvelleExperience.apprentissages}
                onChange={(e) => setNouvelleExperience({...nouvelleExperience, apprentissages: e.target.value})}
                className="w-full p-2 border rounded focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
                placeholder="Qu'avez-vous appris de cette expérience?"
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  ajouterExperience();
                  setShowModal(false);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'information */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Comment utiliser cet outil</h2>
            
            <div className="prose prose-indigo max-w-none">
              <h3>Objectif de l'exercice</h3>
              <p>
                Cet outil vous permet de retracer votre parcours professionnel et personnel dans le cadre d'un bilan de compétences. 
                En documentant vos expériences, vous pourrez :
              </p>
              <ul>
                <li>Visualiser l'évolution de votre bien-être au fil du temps</li>
                <li>Identifier les moments forts et les périodes difficiles</li>
                <li>Reconnaître les compétences acquises tout au long de votre parcours</li>
                <li>Dégager des tendances et des patterns dans votre développement</li>
              </ul>
              
              <h3>Comment procéder</h3>
              <ol>
                <li><strong>Ajoutez vos expériences</strong> : Cliquez sur le bouton "+" pour ajouter une nouvelle expérience.</li>
                <li><strong>Soyez précis</strong> : Décrivez chaque expérience avec suffisamment de détails pour vous en souvenir clairement.</li>
                <li><strong>Évaluez votre bien-être</strong> : Sur une échelle de 1 à 10, évaluez comment vous vous sentiez pendant cette période.</li>
                <li><strong>Notez les compétences</strong> : Identifiez les compétences que vous avez développées ou utilisées.</li>
                <li><strong>Réfléchissez aux apprentissages</strong> : Qu'avez-vous appris de cette expérience?</li>
              </ol>
              
              <h3>Visualisations disponibles</h3>
              <ul>
                <li><strong>Liste</strong> : Affiche toutes vos expériences sous forme de liste détaillée.</li>
                <li><strong>Chronologie</strong> : Présente vos expériences sur une frise chronologique.</li>
                <li><strong>Graphique</strong> : Montre l'évolution de votre niveau de bien-être au fil du temps.</li>
              </ul>
              
              <h3>Conseils pour l'analyse</h3>
              <ul>
                <li>Recherchez les périodes où votre bien-être était élevé. Qu'est-ce qui caractérisait ces moments?</li>
                <li>Identifiez les compétences récurrentes qui apparaissent dans plusieurs expériences.</li>
                <li>Observez l'évolution de votre bien-être en fonction du type d'expérience (professionnelle, personnelle, formation).</li>
                <li>Notez les apprentissages qui vous ont été les plus utiles par la suite.</li>
              </ul>
              
              <p>
                Prenez votre temps pour compléter cet exercice. Vous pouvez y revenir régulièrement pour ajouter de nouvelles expériences 
                ou modifier les existantes. Vos données sont sauvegardées localement dans votre navigateur.
              </p>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                J'ai compris
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;