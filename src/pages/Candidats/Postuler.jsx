import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { candidatApi, offreApi } from '../../api/candidatApi';
import DigitalCVForm from '../../Components/Candidats/DigitalCVForm';

const Postuler = () => {
  const navigate = useNavigate();
  const [offres, setOffres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiStep, setAiStep] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchOffres = async () => {
      try {
        const response = await offreApi.getAll();
        setOffres(Array.isArray(response.data) ? response.data : response.data.data || []);
      } catch (error) {
        console.error('Error fetching offers:', error);
      }
    };
    fetchOffres();
  }, []);

  const handleSubmit = async ({ formData, docs, digitalProfile }) => {
    if (!docs.cv && !digitalProfile?.experiences?.length && !digitalProfile?.competencesList?.length) {
      setMessage({ type: 'error', text: 'Veuillez télécharger un CV ou remplir votre profil digital.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    // Simulate AI steps for UX
    const steps = [
      '📤 Envoi du dossier...',
      '🔍 Extraction du texte (OCR)...',
      '🤖 Analyse IA en cours...',
      '💾 Sauvegarde des résultats...',
    ];
    let stepIndex = 0;
    setAiStep(steps[0]);
    const stepInterval = setInterval(() => {
      stepIndex++;
      if (stepIndex < steps.length) setAiStep(steps[stepIndex]);
    }, 3000);

    const submissionData = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] != null && formData[key] !== '') {
        submissionData.append(key, formData[key]);
      }
    });
    if (docs.cv) submissionData.append('cv', docs.cv);

    // Append digital profile as JSON
    if (digitalProfile) {
      if (digitalProfile.experiences?.length) {
        submissionData.append('experiences', JSON.stringify(digitalProfile.experiences));
      }
      if (digitalProfile.formations?.length) {
        submissionData.append('formations', JSON.stringify(digitalProfile.formations));
      }
      if (digitalProfile.competencesList?.length) {
        submissionData.append('competences_list', JSON.stringify(digitalProfile.competencesList));
      }
      if (digitalProfile.city) submissionData.append('ville', digitalProfile.city);
      if (digitalProfile.birthDate) submissionData.append('date_naissance', digitalProfile.birthDate);
    }

    try {
      const response = await candidatApi.create(submissionData);
      clearInterval(stepInterval);
      setAiStep('');

      if (response.data?.warning) {
        setMessage({ type: 'warning', text: response.data.warning + ' Redirection dans 3 secondes...' });
        setTimeout(() => navigate('/recrutement/candidats'), 3000);
      } else {
        setMessage({ type: 'success', text: 'Candidature envoyée et analysée avec succès !' });
        setTimeout(() => navigate('/recrutement/candidats'), 2000);
      }
    } catch (error) {
      clearInterval(stepInterval);
      setAiStep('');
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Une erreur est survenue lors de l\'envoi.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-2xl mx-auto">

        {/* Back link */}
        <div className="mb-6">
          <Link to="/recrutement/candidats"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 transition-colors text-sm font-bold">
            ← Retour aux candidats
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <h1 className="text-xl sm:text-2xl font-extrabold">CV Numérique</h1>
            <p className="opacity-80 text-sm mt-1">
              Remplissez votre profil ou uploadez un CV — l'IA analysera votre dossier
            </p>
          </div>

          {/* Messages */}
          {message.text && (
            <div className={`mx-6 mt-4 p-4 rounded-xl text-sm font-bold ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
              message.type === 'warning' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
              'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <div className="p-4 sm:p-6">
            <DigitalCVForm
              offres={offres}
              onSubmit={handleSubmit}
              loading={loading}
              aiStep={aiStep}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Postuler;