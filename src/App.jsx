// src/App.jsx
import React, { useState, useEffect } from 'react';
import { db, auth } from './firebaseConfig';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

// Função utilitária para ícones (usando SVG inline para simplicidade)
const Icon = ({ children, className = '' }) => (
  <span className={`inline-block align-middle ${className}`}>{children}</span>
);

function App() {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [currentView, setCurrentView] = useState('parent');

  const [childProfile, setChildProfile] = useState({ name: '', dob: '', age: '', diagnosisType: '', supportLevel: '' });
  const [communicationBehavior, setCommunicationBehavior] = useState({ communicationType: '', alternativeCommunication: '', triggers: '', overloadSigns: '', copingStrategies: '' });
  const [sensoryAspects, setSensoryAspects] = useState({ hypersensitivity: '', hyposensitivity: '', sensoryStrategies: '' });
  const [interestsStrategies, setInterestsStrategies] = useState({ hobbies: '', favoriteActivities: '', environmentalAdaptations: '', routines: '', individualizedSupport: '' });

  useEffect(() => {
    if (!auth) {
        setError("A configuração do Firebase falhou. Verifique o console para mais detalhes.");
        setLoading(false);
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        try {
          await signInAnonymously(auth);
        } catch (authError) {
          console.error("Erro ao fazer login anônimo:", authError);
          setError("Falha na autenticação anônima.");
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!db || !userId) return;

    const userDocRef = doc(db, `users/${userId}/childProfiles`, 'currentProfile');
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setChildProfile(data.childProfile || { name: '', dob: '', age: '', diagnosisType: '', supportLevel: '' });
        setCommunicationBehavior(data.communicationBehavior || { communicationType: '', alternativeCommunication: '', triggers: '', overloadSigns: '', copingStrategies: '' });
        setSensoryAspects(data.sensoryAspects || { hypersensitivity: '', hyposensitivity: '', sensoryStrategies: '' });
        setInterestsStrategies(data.interestsStrategies || { hobbies: '', favoriteActivities: '', environmentalAdaptations: '', routines: '', individualizedSupport: '' });
      }
    }, (err) => {
      console.error("Erro ao carregar dados do perfil:", err);
      showMessageBox("Erro ao carregar dados do perfil.");
    });

    return () => unsubscribe();
  }, [userId]);

  const showMessageBox = (message) => {
    setConfirmationMessage(message);
    setShowConfirmation(true);
    setTimeout(() => setShowConfirmation(false), 3000);
  };

  const handleChildProfileChange = (e) => setChildProfile({ ...childProfile, [e.target.name]: e.target.value });
  const handleCommunicationBehaviorChange = (e) => setCommunicationBehavior({ ...communicationBehavior, [e.target.name]: e.target.value });
  const handleSensoryAspectsChange = (e) => setSensoryAspects({ ...sensoryAspects, [e.target.name]: e.target.value });
  const handleInterestsStrategiesChange = (e) => setInterestsStrategies({ ...interestsStrategies, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!db || !userId) {
      showMessageBox("Erro: Banco de dados não inicializado ou usuário não autenticado.");
      return;
    }
    try {
      const userDocRef = doc(db, `users/${userId}/childProfiles`, 'currentProfile');
      await setDoc(userDocRef, {
        childProfile,
        communicationBehavior,
        sensoryAspects,
        interestsStrategies,
      }, { merge: true });
      showMessageBox("Dados do perfil salvos com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar dados:", err);
      showMessageBox("Erro ao salvar dados do perfil.");
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  if (error) return <div className="flex items-center justify-center min-h-screen">Erro: {error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-4 font-sans">
      {showConfirmation && <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-6 py-3 rounded-lg z-50 animate-fade-in-down">{confirmationMessage}</div>}
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-6 sm:p-8 md:p-10 border-t-8 border-blue-500">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-800 mb-6 flex items-center justify-center gap-3">
          <Icon><svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg></Icon>
          Apoio para Crianças Autistas
        </h1>
        <p className="text-center text-gray-600 mb-8">Preencha as informações para nos ajudar a criar um ambiente escolar mais adaptado e inclusivo.</p>
        {userId && <div className="text-sm text-gray-500 text-right mb-4">ID: <span className="font-mono bg-gray-100 p-1 rounded">{userId}</span></div>}
        <div className="flex justify-center mb-8 gap-4">
          <button onClick={() => setCurrentView('parent')} className={`py-2 px-6 rounded-full text-lg font-semibold transition-all ${currentView === 'parent' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-blue-100'}`}>Modo Responsável</button>
          <button onClick={() => setCurrentView('child')} className={`py-2 px-6 rounded-full text-lg font-semibold transition-all ${currentView === 'child' ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-purple-100'}`}>Modo Criança</button>
        </div>
        {currentView === 'parent' ? (
          <form onSubmit={handleSubmit} className="space-y-8">
            <Section title="1. Perfil da Criança" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}>
              <InputField label="Nome Completo" name="name" value={childProfile.name} onChange={handleChildProfileChange} placeholder="Nome da criança" required />
              <InputField label="Data de Nascimento" name="dob" type="date" value={childProfile.dob} onChange={handleChildProfileChange} required />
              <InputField label="Idade" name="age" type="number" value={childProfile.age} onChange={handleChildProfileChange} placeholder="Idade em anos" />
              <SelectField label="Tipo de Diagnóstico" name="diagnosisType" value={childProfile.diagnosisType} onChange={handleChildProfileChange} options={[{value: '', label: 'Selecione...'}, {value: 'TEA Nível 1', label: 'TEA Nível 1'}, {value: 'TEA Nível 2', label: 'TEA Nível 2'}, {value: 'TEA Nível 3', label: 'TEA Nível 3'}, {value: 'Outro', label: 'Outro'}]} />
              <SelectField label="Grau de Suporte" name="supportLevel" value={childProfile.supportLevel} onChange={handleChildProfileChange} options={[{value: '', label: 'Selecione...'}, {value: 'Baixo', label: 'Baixo'}, {value: 'Moderado', label: 'Moderado'}, {value: 'Alto', label: 'Alto'}]} />
            </Section>
            <Section title="2. Comunicação e Comportamento" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>}>
              <SelectField label="Comunicação Predominante" name="communicationType" value={communicationBehavior.communicationType} onChange={handleCommunicationBehaviorChange} options={[{value: '', label: 'Selecione...'}, {value: 'Verbal', label: 'Verbal'}, {value: 'Não-verbal', label: 'Não-verbal'}, {value: 'CAA', label: 'CAA'}]} />
              <TextAreaField label="Necessidade de Comunicação Alternativa" name="alternativeCommunication" value={communicationBehavior.alternativeCommunication} onChange={handleCommunicationBehaviorChange} placeholder="Descreva as necessidades de CAA, se houver (ex: pranchas, pictogramas, apps)." />
              <TextAreaField label="Gatilhos Comportamentais" name="triggers" value={communicationBehavior.triggers} onChange={handleCommunicationBehaviorChange} placeholder="Ex: barulhos altos, mudanças de rotina, luzes fortes." />
              <TextAreaField label="Sinais de Sobrecarga" name="overloadSigns" value={communicationBehavior.overloadSigns} onChange={handleCommunicationBehaviorChange} placeholder="Ex: agitação, isolamento, auto-estimulação." />
              <TextAreaField label="Estratégias de Manejo" name="copingStrategies" value={communicationBehavior.copingStrategies} onChange={handleCommunicationBehaviorChange} placeholder="Ex: oferecer um espaço calmo, usar reforço positivo, prever mudanças." />
            </Section>
            <Section title="3. Aspectos Sensoriais" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2c-.5 0-1 .5-1 1v18c0 .5.5 1 1 1s1-.5 1-1V3c0-.5-.5-1-1-1Z" /><path d="M12 17a5 5 0 0 1 5 5H7a5 5 0 0 1 5-5Z" /></svg>}>
                <TextAreaField label="Hipersensibilidade (Ex: sons, luzes, texturas)" name="hypersensitivity" value={sensoryAspects.hypersensitivity} onChange={handleSensoryAspectsChange} placeholder="Descreva as hipersensibilidades da criança." />
                <TextAreaField label="Hiposensibilidade (Ex: necessidade de movimento, pressão)" name="hyposensitivity" value={sensoryAspects.hyposensitivity} onChange={handleSensoryAspectsChange} placeholder="Descreva as hiposensibilidades da criança." />
                <TextAreaField label="Estratégias para Lidar com Aspectos Sensoriais" name="sensoryStrategies" value={sensoryAspects.sensoryStrategies} onChange={handleSensoryAspectsChange} placeholder="Ex: fones de ouvido, brinquedos sensoriais, pausas ativas." />
            </Section>
            <Section title="4. Interesses e Estratégias de Apoio na Escola" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 17h3a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h3" /><path d="M18 22V17" /><path d="M9 17v5" /><path d="M12 17v5" /><path d="M15 17h-6" /></svg>}>
                <TextAreaField label="Hobbies e Interesses Especiais" name="hobbies" value={interestsStrategies.hobbies} onChange={handleInterestsStrategiesChange} placeholder="Ex: dinossauros, trens, computadores, música." />
                <TextAreaField label="Atividades Favoritas na Escola" name="favoriteActivities" value={interestsStrategies.favoriteActivities} onChange={handleInterestsStrategiesChange} placeholder="Ex: artes, educação física, leitura, matemática." />
                <TextAreaField label="Adaptações no Ambiente Escolar" name="environmentalAdaptations" value={interestsStrategies.environmentalAdaptations} onChange={handleInterestsStrategiesChange} placeholder="Ex: assento preferencial, espaço calmo, iluminação." />
                <TextAreaField label="Rotinas e Estruturas que Ajudam" name="routines" value={interestsStrategies.routines} onChange={handleInterestsStrategiesChange} placeholder="Ex: uso de quadros visuais, horários previsíveis." />
                <TextAreaField label="Suporte Individualizado (se necessário)" name="individualizedSupport" value={interestsStrategies.individualizedSupport} onChange={handleInterestsStrategiesChange} placeholder="Ex: apoio de um assistente, instruções claras e diretas." />
            </Section>
            <div className="flex justify-center mt-10">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition duration-300 hover:scale-105">
                Salvar Informações
              </button>
            </div>
          </form>
        ) : (
          <ChildDashboard childName={childProfile.name} routines={interestsStrategies.routines} hobbies={interestsStrategies.hobbies} favoriteActivities={interestsStrategies.favoriteActivities} />
        )}
      </div>
    </div>
  );
}

const Section = ({ title, icon, children }) => (
  <div className="bg-gray-50 p-6 rounded-lg shadow-inner border border-gray-200">
    <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-6 flex items-center gap-3 pb-4 border-b border-gray-200">
      {icon}
      {title}
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
  </div>
);

const InputField = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input {...props} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150" />
  </div>
);

const TextAreaField = ({ label, ...props }) => (
  <div className="md:col-span-2">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <textarea {...props} rows="3" className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150" />
  </div>
);

const SelectField = ({ label, options, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select {...props} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150">
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const ChildDashboard = ({ childName, routines, hobbies, favoriteActivities }) => {
  const parsedRoutines = (routines || '').split('\n').filter(Boolean);
  return (
    <div className="p-6 bg-purple-50 rounded-lg shadow-inner border border-purple-200">
      <h2 className="text-2xl font-bold text-center text-purple-700 mb-4">Olá, {childName || 'Criança'}!</h2>
      <p className="text-center text-purple-600 mb-8">Vamos ver suas atividades de hoje!</p>
      {parsedRoutines.length > 0 ? (
        <div className="space-y-4">
          {parsedRoutines.map((routine, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
              <span className="text-2xl">✨</span>
              <span className="text-gray-800">{routine}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 italic">Nenhuma rotina cadastrada ainda.</p>
      )}
    </div>
  );
};

export default App;
