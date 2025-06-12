// src/App.jsx
import React, { useState, useEffect } from 'react';
import { db, auth } from './firebaseConfig';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut 
} from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

// ####################################################################
// ## COMPONENTE DE AUTENTICAÇÃO (LOGIN E REGISTO)                  ##
// ####################################################################
const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      console.error("Erro na autenticação:", err.code);
      let friendlyMessage = "Ocorreu um erro. Tente novamente.";
      switch (err.code) {
        case 'auth/invalid-email':
          friendlyMessage = "O formato do e-mail é inválido.";
          break;
        case 'auth/user-not-found':
        case 'auth/invalid-credential':
          friendlyMessage = "E-mail ou senha não encontrados. Verifique os dados e tente novamente.";
          break;
        case 'auth/wrong-password':
          friendlyMessage = "Senha incorreta. Tente novamente.";
          break;
        case 'auth/email-already-in-use':
          friendlyMessage = "Este endereço de e-mail já está em uso por outra conta.";
          break;
        case 'auth/weak-password':
          friendlyMessage = "A senha é muito fraca. Ela deve ter pelo menos 6 caracteres.";
          break;
        default:
          friendlyMessage = "Ocorreu um erro inesperado durante a autenticação.";
          break;
      }
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-2xl">
        <h2 className="text-3xl font-extrabold text-center text-gray-800">
          {isLogin ? 'Bem-vindo de Volta!' : 'Crie sua Conta'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Endereço de e-mail" required className="w-full px-4 py-2 text-lg border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"/>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" required className="w-full px-4 py-2 text-lg border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"/>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-3 text-lg font-semibold text-white bg-blue-600 rounded-md shadow-lg hover:bg-blue-700 disabled:bg-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-300">
            {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Registar')}
          </button>
        </form>
        <p className="text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="font-medium text-blue-600 hover:text-blue-500">
            {isLogin ? 'Não tem uma conta? Registre-se' : 'Já tem uma conta? Entre'}
          </button>
        </p>
      </div>
    </div>
  );
};

// ####################################################################
// ## COMPONENTE PRINCIPAL DA APLICAÇÃO (APÓS LOGIN)                 ##
// ####################################################################
const MainApplication = ({ user }) => {
  const [loadingData, setLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [currentView, setCurrentView] = useState('parent');

  const [childProfile, setChildProfile] = useState({ name: '', dob: '', age: '', diagnosisType: '', supportLevel: '' });
  const [communicationBehavior, setCommunicationBehavior] = useState({ communicationType: '', alternativeCommunication: '', triggers: '', overloadSigns: '', copingStrategies: '' });
  const [sensoryAspects, setSensoryAspects] = useState({ hypersensitivity: '', hyposensitivity: '', sensoryStrategies: '' });
  const [interestsStrategies, setInterestsStrategies] = useState({ hobbies: '', favoriteActivities: '', environmentalAdaptations: '', routines: '', individualizedSupport: '' });

  useEffect(() => {
    if (!db || !user) {
        return;
    }
    setLoadingData(true);
    const userDocRef = doc(db, `users/${user.uid}/childProfiles`, 'currentProfile');
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setChildProfile(data.childProfile || { name: '', dob: '', age: '', diagnosisType: '', supportLevel: '' });
        setCommunicationBehavior(data.communicationBehavior || { communicationType: '', alternativeCommunication: '', triggers: '', overloadSigns: '', copingStrategies: '' });
        setSensoryAspects(data.sensoryAspects || { hypersensitivity: '', hyposensitivity: '', sensoryStrategies: '' });
        setInterestsStrategies(data.interestsStrategies || { hobbies: '', favoriteActivities: '', environmentalAdaptations: '', routines: '', individualizedSupport: '' });
      }
      setLoadingData(false);
    }, (err) => {
      console.error("Erro ao carregar dados do perfil via onSnapshot:", err);
      setLoadingData(false);
    });
    return () => {
        unsubscribe();
    }
  }, [user]);

  const showMessageBox = (message, duration = 3000) => {
   setConfirmationMessage(message);
   setShowConfirmation(true);
   setTimeout(() => setShowConfirmation(false), duration);
  };

  const handleLogout = async () => {
   try {
     await signOut(auth);
   } catch (error) {
     console.error("Erro ao sair:", error);
   }
  };

  const handleChildProfileChange = (e) => setChildProfile({ ...childProfile, [e.target.name]: e.target.value });
  const handleCommunicationBehaviorChange = (e) => setCommunicationBehavior({ ...communicationBehavior, [e.target.name]: e.target.value });
  const handleSensoryAspectsChange = (e) => setSensoryAspects({ ...sensoryAspects, [e.target.name]: e.target.value });
  const handleInterestsStrategiesChange = (e) => setInterestsStrategies({ ...interestsStrategies, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const userDocRef = doc(db, `users/${user.uid}/childProfiles`, 'currentProfile');
      await setDoc(userDocRef, {
        childProfile,
        communicationBehavior,
        sensoryAspects,
        interestsStrategies,
      }, { merge: true });
      showMessageBox("Dados salvos com sucesso! A mudar para o Modo Criança...", 2000);
      setTimeout(() => {
        setCurrentView('child');
      }, 2000);
    } catch (err) {
      console.error("Erro ao salvar dados:", err);
      showMessageBox("Erro ao salvar dados do perfil.");
    } finally {
        setIsSaving(false);
    }
  };

  if (loadingData) {
    return <div className="flex items-center justify-center min-h-screen">Carregando dados...</div>;
  }

  return (
   <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-4 font-sans">
     {showConfirmation && <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-6 py-3 rounded-lg z-50">{confirmationMessage}</div>}
     <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-6 sm:p-8 md:p-10 border-t-8 border-blue-500">
       <div className="flex justify-between items-center mb-4">
           <p className="text-sm text-gray-600">Logado como: <span className="font-semibold">{user.email}</span></p>
           <button onClick={handleLogout} className="text-sm font-semibold text-red-600 hover:text-red-800">Sair</button>
       </div>
       <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-800 mb-6 flex items-center justify-center gap-3">
         <Icon><svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg></Icon>
         Apoio para Crianças Autistas
       </h1>
       <p className="text-center text-gray-600 mb-8">Preencha as informações para nos ajudar a criar um ambiente escolar mais adaptado e inclusivo.</p>
       <div className="flex justify-center mb-8 gap-4">
         <button onClick={() => setCurrentView('parent')} className={`py-2 px-6 rounded-full text-lg font-semibold transition-all ${currentView === 'parent' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200'}`}>Modo Responsável</button>
         <button onClick={() => setCurrentView('child')} className={`py-2 px-6 rounded-full text-lg font-semibold transition-all ${currentView === 'child' ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-200'}`}>Modo Criança</button>
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
             <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg" disabled={isSaving}>
               {isSaving ? 'Salvando...' : 'Salvar Informações'}
             </button>
           </div>
         </form>
       ) : (
         <ChildDashboard 
            userId={user.uid} 
            db={db} 
            childProfile={childProfile}
            interestsStrategies={interestsStrategies}
         />
       )}
     </div>
   </div>
  );
};

// ####################################################################
// ## COMPONENTE RAIZ (DECIDE O QUE MOSTRAR)                         ##
// ####################################################################
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Verificando autenticação...</div>;
  }

  return user ? <MainApplication user={user} /> : <AuthForm />;
}

// Componentes auxiliares (permanecem os mesmos)
const Icon = ({ children, className = '' }) => ( <span className={`inline-block align-middle ${className}`}>{children}</span> );
const Section = ({ title, icon, children }) => ( <div className="bg-gray-50 p-6 rounded-lg shadow-inner border border-gray-200"><h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-6 flex items-center gap-3 pb-4 border-b">{icon}{title}</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div></div> );
const InputField = ({ label, ...props }) => ( <div><label className="block text-sm font-medium text-gray-700 mb-1">{label}</label><input {...props} className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm" /></div> );
const TextAreaField = ({ label, ...props }) => ( <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">{label}</label><textarea {...props} rows="3" className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm" /></div> );
const SelectField = ({ label, options, ...props }) => ( <div><label className="block text-sm font-medium text-gray-700 mb-1">{label}</label><select {...props} className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm">{options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div> );

const ChildDashboard = ({ db, userId, childProfile, interestsStrategies }) => {
    const { name: childName } = childProfile;
    const { routines, hobbies, favoriteActivities } = interestsStrategies;

    const parsedRoutines = (routines || '').split('\n').filter(Boolean);
    const [completedTasks, setCompletedTasks] = useState({});

    const tasksDocRef = userId ? doc(db, `users/${userId}/childTasks`, 'dailyTasks') : null;

    useEffect(() => {
        if (!tasksDocRef) return;
        const unsubscribe = onSnapshot(tasksDocRef, (docSnap) => {
            if (docSnap.exists()) setCompletedTasks(docSnap.data().tasks || {});
        });
        return () => unsubscribe();
    }, [tasksDocRef]);

    const handleTaskToggle = async (index) => {
      if (!tasksDocRef) return;
      const newTasks = { ...completedTasks, [index]: !completedTasks[index] };
      await setDoc(tasksDocRef, { tasks: newTasks }, { merge: true });
    };

    const getEmojiForTask = (task) => {
        const lowerCaseTask = task.toLowerCase();
        if (lowerCaseTask.includes('escola') || lowerCaseTask.includes('aula')) return '🏫';
        if (lowerCaseTask.includes('comer') || lowerCaseTask.includes('refeição')) return '🍽️';
        if (lowerCaseTask.includes('brincar') || lowerCaseTask.includes('jogar')) return '🧸';
        if (lowerCaseTask.includes('dormir') || lowerCaseTask.includes('cama')) return '😴';
        if (lowerCaseTask.includes('banho') || lowerCaseTask.includes('higiene')) return '🛁';
        if (lowerCaseTask.includes('ler') || lowerCaseTask.includes('livro')) return '📚';
        if (lowerCaseTask.includes('tarefa') || lowerCaseTask.includes('dever')) return '✍️';
        return '✨';
    };

    return (
      <div className="p-6 bg-purple-50 rounded-lg"><h2 className="text-2xl font-bold text-center">Olá, {childName || 'Criança'}!</h2><p className="text-center mb-8">Vamos ver suas atividades!</p>
        <div className="mb-10">
          <h3 className="text-xl font-semibold mb-4 text-purple-800">Rotina Diária</h3>
          {parsedRoutines.length > 0 ? (
            <div className="space-y-4">{parsedRoutines.map((routine, index) => (
                <div key={index} onClick={() => handleTaskToggle(index)} className={`flex items-center gap-4 p-4 rounded-xl shadow-lg cursor-pointer ${completedTasks[index] ? 'bg-green-100' : 'bg-white'}`}>
                  <span>{getEmojiForTask(routine)}</span><span className={completedTasks[index] ? 'line-through text-gray-500' : ''}>{routine}</span>
                  {completedTasks[index] && <Icon className="ml-auto text-green-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg></Icon>}
                </div>
              ))}</div>
          ) : <p className="text-center italic text-gray-600">Nenhuma rotina cadastrada.</p>}
        </div>

        {(hobbies || favoriteActivities) && (
         <div className="mt-12 p-5 bg-purple-100 rounded-lg shadow-md border border-purple-300">
           <h3 className="text-xl font-bold text-purple-700 mb-4">Lembretes Divertidos!</h3>
            {hobbies && <p className="text-gray-700 mb-2">Seus interesses: <span className="font-semibold text-purple-800">{hobbies}</span></p>}
            {favoriteActivities && <p className="text-gray-700">Sua atividade favorita na escola é: <span className="font-semibold text-purple-800">{favoriteActivities}</span></p>}
         </div>
       )}
      </div>
    );
};

export default App;
